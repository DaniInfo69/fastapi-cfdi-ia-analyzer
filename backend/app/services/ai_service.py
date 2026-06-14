import io
import json
import os
import re # <-- Importante para limpiar textos
import PyPDF2
from openai import OpenAI

class AIService:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes, max_pages: int = 5) -> str:
        try:
            pdf_stream = io.BytesIO(file_bytes)
            reader = PyPDF2.PdfReader(pdf_stream)
            full_text = ""
            pages_to_read = min(max_pages, len(reader.pages))
            
            for page_num in range(pages_to_read):
                page_text = reader.pages[page_num].extract_text()
                if page_text:
                    full_text += page_text + " "
            
            # OPTIMIZACIÓN DE TOKENS: 
            # Reemplaza múltiples espacios y saltos de línea por un solo espacio.
            clean_text = re.sub(r'\s+', ' ', full_text).strip()
            
            # VALIDACIÓN DE IMÁGENES:
            # Una constancia o acta real tiene miles de caracteres. 
            # Si tiene menos de 50, casi seguro es un documento escaneado (imágenes).
            if len(clean_text) < 50 and pages_to_read > 0:
                raise ValueError("El documento parece ser un escaneo o contener solo imágenes. Por favor, sube PDFs con texto seleccionable.")
                
            return clean_text
        except ValueError as ve:
            raise ve # Pasamos el error específico hacia el router
        except Exception as e:
            raise Exception(f"Error leyendo el PDF: {str(e)}")

    @staticmethod
    def process_xml_cfdi(file_bytes: bytes) -> str:
        """
        Lee el XML y lo comprime en una sola línea eliminando espacios y saltos.
        Esto hace que la IA lo lea perfectamente pero gastando muchos menos tokens.
        """
        try:
            xml_text = file_bytes.decode('utf-8')
            # Limpiamos el XML de espacios innecesarios
            clean_xml = re.sub(r'\s+', ' ', xml_text).strip()
            return clean_xml
        except Exception as e:
            raise Exception(f"Error procesando el archivo XML: {str(e)}")

    @classmethod
    def analyze_fiscal_health(
        cls, 
        tax_status_text: str, 
        compliance_text: str, 
        cfdi_text: str, # <-- Nuevo parámetro para el CFDI
        bylaws_text: str = "Not provided", 
        additional_context: str = ""
    ):
        system_prompt = """
        Eres un auditor fiscal corporativo experto en México (SAT). 
        Tu tarea es analizar si la factura (CFDI) proporcionada es estrictamente indispensable y DEDUCIBLE para el contribuyente, basándote en su Constancia de Situación Fiscal (CSF), Opinión de Cumplimiento y Acta Constitutiva.
        
        Debes responder EXCLUSIVAMENTE con un objeto JSON válido usando esta estructura exacta:
        {
            "nivel_riesgo": "Bajo" | "Medio" | "Alto",
            "deducible": "Sí" | "No" | "Requiere revisión manual",
            "resumen": "string",
            "justificacion_legal": "string",
            "advertencias": ["lista de strings"]
        }
        
        Reglas para los campos:
        - nivel_riesgo: Usa "Bajo" si es claramente deducible o no deducible. Usa "Medio" o "Alto" si la información es ambigua o si la Opinión de Cumplimiento es negativa.
        - deducible: Conclusión directa sobre el gasto en el CFDI.
        - resumen: Un breve resumen directivo del análisis y los puntos clave a considerar.
        - justificacion_legal: Fundamento fiscal del porqué se aprueba o rechaza.
        - advertencias: Alertas sobre el estado del contribuyente.
        """

        user_prompt = f"""
        --- TAX STATUS CERTIFICATE (CSF) ---
        {tax_status_text}
        
        --- COMPLIANCE OPINION ---
        {compliance_text}
        
        --- BYLAWS / CONSTITUTIONAL ACT ---
        {bylaws_text}

        --- CFDI A ANALIZAR (FACTURA XML) ---
        {cfdi_text}

        --- CONTEXTO ADICIONAL ---
        {additional_context}
        """

        response = cls.client.chat.completions.create(
            model="gpt-4o-mini", 
            response_format={ "type": "json_object" }, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2 
        )
        
        return json.loads(response.choices[0].message.content)
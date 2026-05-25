import io
import json
import os
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
            # Limit the number of pages to optimize token usage
            pages_to_read = min(max_pages, len(reader.pages))
            
            for page_num in range(pages_to_read):
                full_text += reader.pages[page_num].extract_text() + "\n"
            
            return full_text.strip()
        except Exception as e:
            return f"Error reading PDF in memory: {str(e)}"

    @classmethod
    def analyze_fiscal_health(
        cls, 
        tax_status_text: str, 
        compliance_text: str, 
        bylaws_text: str = "Not provided", 
        additional_context: str = ""
    ):
        """
        Envía el texto extraído a OpenAI para analizar si un gasto (CFDI) 
        es deducible basándose en la salud fiscal y giro de la entidad.
        """
        system_prompt = """
        Eres un auditor fiscal corporativo experto en México (SAT). 
        Tu tarea es analizar si un gasto o factura (mencionado en el contexto adicional) es estrictamente indispensable y DEDUCIBLE para el contribuyente, basándote en su Constancia de Situación Fiscal (CSF), Opinión de Cumplimiento y Acta Constitutiva.
        
        Debes responder EXCLUSIVAMENTE con un objeto JSON válido usando esta estructura exacta:
        {
            "nivel_riesgo": "Bajo" | "Medio" | "Alto",
            "deducible": "Sí" | "No" | "Requiere revisión manual",
            "resumen": "string",
            "justificacion_legal": "string",
            "advertencias": ["lista de strings"]
        }
        
        Reglas para los campos:
        - nivel_riesgo: Usa "Bajo" si es claramente deducible o no deducible. Usa "Medio" o "Alto" si la información es ambigua, si el régimen fiscal no concuerda del todo con el gasto, o si la Opinión de Cumplimiento es negativa.
        - deducible: Conclusión directa sobre el gasto.
        - resumen: Un breve resumen directivo del análisis y los puntos clave a considerar.
        - justificacion_legal: Fundamento fiscal o de negocio del porqué se aprueba o rechaza (ej. "No es estrictamente indispensable para el giro descrito en el Acta Constitutiva").
        - advertencias: Alertas sobre el estado del contribuyente (ej. "La opinión de cumplimiento es negativa, no se pueden deducir gastos").
        """

        user_prompt = f"""
        --- TAX STATUS CERTIFICATE (CSF) ---
        {tax_status_text}
        
        --- COMPLIANCE OPINION ---
        {compliance_text}
        
        --- BYLAWS / CONSTITUTIONAL ACT ---
        {bylaws_text}

        --- CONTEXTO ADICIONAL (DETALLES DEL GASTO / CFDI) ---
        {additional_context}
        """

        response = cls.client.chat.completions.create(
            model="gpt-4o-mini", 
            response_format={ "type": "json_object" }, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2 # To reduce randomness in the response.
        )
        
        return json.loads(response.choices[0].message.content)
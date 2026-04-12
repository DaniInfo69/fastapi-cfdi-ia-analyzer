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
        Sends extracted text to OpenAI to analyze the fiscal health of the entity.
        """
        system_prompt = """
        You are an expert corporate tax auditor in Mexico. 
        Your task is to analyze the fiscal health of a taxpayer based on their documentation.
        You must respond ONLY with a valid JSON object using this exact structure:
        {
            "entity_summary": "string",
            "compliance_status": "POSITIVE" | "NEGATIVE",
            "detected_risks": ["list of strings"],
            "recommendations": ["list of strings"]
        }
        """

        user_prompt = f"""
        --- TAX STATUS CERTIFICATE (CSF) ---
        {tax_status_text}
        
        --- COMPLIANCE OPINION ---
        {compliance_text}
        
        --- BYLAWS / CONSTITUTIONAL ACT ---
        {bylaws_text}

        --- ADDITIONAL CONTEXT ---
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
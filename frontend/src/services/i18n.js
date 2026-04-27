// src/services/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "title": "AI Fiscal Analyzer",
            "upload_csf": "Upload Tax Status (CSF) *",
            "upload_opinion": "Compliance Opinion *",
            "bylaws": "Bylaws (Optional)",
            "employees": "Number of Employees",
            "location": "Location",
            "extra_context": "Extra Context for AI",
            "analyze_btn": "Start AI Analysis",
            "loading": "Analyzing documents...",
            "light_mode": "Light",
            "dark_mode": "Dark"
        }
    },
    es: {
        translation: {
            "title": "Analizador Fiscal con IA",
            "upload_csf": "Subir Constancia Fiscal (CSF) *",
            "upload_opinion": "Opinión de Cumplimiento *",
            "bylaws": "Acta Constitutiva (Opcional)",
            "employees": "Número de Empleados",
            "location": "Ubicación",
            "extra_context": "Contexto extra para la IA",
            "analyze_btn": "Iniciar Análisis con IA",
            "loading": "Analizando documentos...",
            "light_mode": "Claro",
            "dark_mode": "Oscuro"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // Idioma por defecto
        fallbackLng: "en",
        interpolation: { escapeValue: false }
    });

export default i18n;
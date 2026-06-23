// src/services/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // General & Navbar
            "title": "AI Fiscal Analyzer",
            "logout": "Logout",
            "loading": "Loading...",
            "light_mode": "Light",
            "dark_mode": "Dark",
            
            // Login Page
            "login_title": "Sign In",
            "email": "Email",
            "password": "Password",
            "remember_me": "Remember me",
            "login_btn": "Log In",
            "login_error": "Invalid email or password",
            
            // Analysis Page
            "upload_csf": "Upload Tax Status (CSF) *",
            "upload_opinion": "Compliance Opinion (Optional)",
            "bylaws": "Bylaws (Optional)",
            "upload_cfdi": "Upload CFDI (XML) *",
            "employees": "Number of Employees",
            "location": "Location",
            "extra_context": "Extra Context for AI",
            "analyze_btn": "Start AI Analysis",
            "analyzing": "Analyzing documents...",
            "file_required": "Please upload the required files.",
            
            // History Page
            "history_title": "Analysis History",
            "history_desc": "Your recent analysis linked to your account.",
            "date": "Date",
            "regime": "Regime",
            "risk_label": "Risk",
            "deductible_label": "Deductible",
            "summary": "Summary",
            "empty_history": "You don't have any analysis history yet.",
            
            // Admin Page
            "admin_title": "Admin Panel",
            "create_user": "Create New User",
            "user_role": "Role",
            "role_admin": "Admin",
            "role_user": "User",
            "create_btn": "Create Account",

            // Database Dynamic Values
            "risk": {
                "Low": "Low",
                "Medium": "Medium",
                "High": "High",
                "Unknown": "Unknown"
            },
            "deductible": {
                "Yes": "Yes",
                "No": "No",
                "Requires manual review": "Requires manual review",
                "Unknown": "Unknown"
            }
        }
    },
    es: {
        translation: {
            // General & Navbar
            "title": "Analizador Fiscal IA",
            "logout": "Cerrar Sesión",
            "loading": "Cargando...",
            "light_mode": "Claro",
            "dark_mode": "Oscuro",
            
            // Login Page
            "login_title": "Iniciar Sesión",
            "email": "Correo Electrónico",
            "password": "Contraseña",
            "remember_me": "Recordarme",
            "login_btn": "Ingresar",
            "login_error": "Correo o contraseña inválidos",

            // Analysis Page
            "upload_csf": "Subir Constancia Fiscal (CSF) *",
            "upload_opinion": "Opinión de Cumplimiento (Opcional)",
            "bylaws": "Acta Constitutiva (Opcional)",
            "upload_cfdi": "Subir CFDI (XML) *",
            "employees": "Número de Empleados",
            "location": "Ubicación",
            "extra_context": "Contexto extra para la IA",
            "analyze_btn": "Iniciar Análisis con IA",
            "analyzing": "Analizando documentos...",
            "file_required": "Por favor sube los documentos requeridos.",

            // History Page
            "history_title": "Historial de Análisis",
            "history_desc": "Tus análisis recientes vinculados a tu cuenta.",
            "date": "Fecha",
            "regime": "Régimen",
            "risk_label": "Riesgo",
            "deductible_label": "Deducible",
            "summary": "Resumen",
            "empty_history": "Aún no tienes análisis en tu historial.",
            
            // Admin Page
            "admin_title": "Panel de Administración",
            "create_user": "Crear Nuevo Usuario",
            "user_role": "Rol",
            "role_admin": "Administrador",
            "role_user": "Usuario",
            "create_btn": "Crear Cuenta",

            // Database Dynamic Values
            "risk": {
                "Low": "Bajo",
                "Medium": "Medio",
                "High": "Alto",
                "Unknown": "Desconocido"
            },
            "deductible": {
                "Yes": "Sí",
                "No": "No",
                "Requires manual review": "Requiere revisión manual",
                "Unknown": "Desconocido"
            }
        }
    }
};

i18n
    .use(LanguageDetector) // 1. Conectamos el detector mágico
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: ['en', 'es'], // 2. SOLO permitimos estos dos idiomas
        fallbackLng: 'en',           // 3. Si su navegador está en Japonés o Alemán, caerá a Inglés
        interpolation: { escapeValue: false },
        detection: {
            // Orden de prioridad: URL primero, luego memoria local, luego navegador
            order: ['querystring', 'localStorage', 'navigator'],
            // Guarda la elección del usuario en localStorage para recordarlo la próxima vez
            caches: ['localStorage'], 
        }
    });

export default i18n;
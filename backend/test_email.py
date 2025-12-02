# test_email_real.py - ENVOI RÉEL
import os
import django

# FORCER le backend SMTP personnalisé
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['EMAIL_BACKEND'] = 'utils.custom_smtp_backend.CustomSMTPBackend'  # ← Backend personnalisé
os.environ['EMAIL_HOST_PASSWORD'] = 'vppn cmiu xhpp vryg'  # ← Mot de passe qui marche

django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 60)
print("🚀 TEST ENVOI EMAIL RÉEL")
print("=" * 60)
print(f"Backend utilisé: {settings.EMAIL_BACKEND}")
print(f"SMTP Server: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
print(f"Utilisateur: {settings.EMAIL_HOST_USER}")
print(f"TLS activé: {settings.EMAIL_USE_TLS}")
print(f"SSL activé: {settings.EMAIL_USE_SSL}")
print("-" * 60)

try:
    print("Envoi en cours...")
    
    result = send_mail(
        subject='✅ Test Email Réel - GymFlow',
        message='''
Bonjour,

Ceci est un email de test envoyé depuis Django.

Si vous recevez cet email, la configuration SMTP fonctionne correctement !

Cordialement,
L'équipe GymFlow
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['siwarlassouedd@gmail.com'],  # ← Changez pour votre email
        fail_silently=False,
    )
    
    print(f"✅ RÉSULTAT: Email envoyé avec succès ! (code: {result})")
    print("📧 Vérifiez votre boîte de réception (et les spams)")
    
except Exception as e:
    print(f"❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()
    
    # Test alternatif avec smtplib pur
    print("\n" + "=" * 60)
    print("🔄 Tentative avec smtplib pur...")
    print("=" * 60)
    
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    
    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        msg = MIMEText('Test direct avec smtplib')
        msg['Subject'] = 'Test SMTPLib pur'
        msg['From'] = 'hamdanasahar06@gmail.com'
        msg['To'] = 'siwarlassouedd@gmail.com'
        
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login('hamdanasahar06@gmail.com', 'wtfg jexi stwy icwl')
            server.send_message(msg)
        
        print("✅ SMTPLib pur fonctionne !")
        print("⚠️  Le problème vient de Django, pas de Gmail")
        
    except Exception as e2:
        print(f"❌ SMTPLib aussi échoue: {e2}")
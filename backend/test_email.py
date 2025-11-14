import smtplib, ssl
from email.mime.text import MIMEText

print("=" * 60)
print("TEST ENVOI EMAIL")
print("=" * 60)

# --- Configuration ---
smtp_server = "smtp.gmail.com"
port = 587
sender = "hamdanasahar06@gmail.com"
receiver = "hamdanasahar06@gmail.com"
password = "wtfg jexi stwy icwl"  # ⚠️ Mets ici ton mot de passe d’application Gmail

print("\nConfiguration:")
print(f"HOST: {smtp_server}")
print(f"PORT: {port}")
print(f"USER: {sender}\n")

# --- Message ---
message = MIMEText("Ceci est un email de test envoyé depuis Python.")
message["Subject"] = "Test Email - Gym Flow"
message["From"] = sender
message["To"] = receiver

# --- Contexte SSL pour éviter l'erreur ---
context = ssl._create_unverified_context()


try:
    print("Envoi email de test...")
    with smtplib.SMTP(smtp_server, port) as server:
        server.ehlo()
        server.starttls(context=context)  # ✅ Utilisation du bon contexte SSL
        server.login(sender, password)
        server.send_message(message)
    print("✅ Email envoyé avec succès !")

except Exception as e:
    print(f"❌ ERREUR: {e}")

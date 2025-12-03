# backend/subscriptions/email_service.py

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger('email')


def send_payment_confirmation_email(subscription, invoice=None):
    """
    Envoyer un email de confirmation de paiement au membre
    
    Args:
        subscription: L'objet Subscription
        invoice: L'objet Invoice (optionnel)
    """
    try:
        member = subscription.member
        
        # Contexte pour le template
        context = {
            'member_name': member.full_name,
            'member_id': member.member_id,
            'plan_name': subscription.plan.name,
            'duration_days': subscription.plan.duration_days,
            'amount_paid': float(subscription.amount_paid),
            'start_date': subscription.start_date.strftime('%d/%m/%Y'),
            'end_date': subscription.end_date.strftime('%d/%m/%Y'),
            'invoice_number': invoice.invoice_number if invoice else 'En cours de génération',
            'payment_method': subscription.payment_method or 'Stripe',
            'company_name': 'GymFlow',
        }
        
        # Sujet de l'email
        subject = f'✅ Confirmation de paiement - Abonnement {subscription.plan.name}'
        
        # Corps de l'email en texte brut
        text_content = f"""
Bonjour {member.full_name},

Nous vous confirmons que votre paiement a été effectué avec succès !

📋 DÉTAILS DE VOTRE ABONNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Plan : {subscription.plan.name}
• Durée : {subscription.plan.duration_days} jours
• Montant payé : {float(subscription.amount_paid):.3f} TND
• Date de début : {context['start_date']}
• Date de fin : {context['end_date']}
• Numéro de facture : {context['invoice_number']}

🎉 PROCHAINES ÉTAPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Téléchargez votre facture depuis votre espace membre
2. Réservez vos cours collectifs
3. Consultez vos programmes d'entraînement

📱 ACCÉDER À VOTRE ESPACE
Connectez-vous sur : {settings.FRONTEND_URL}/portal/dashboard

💳 INFORMATIONS DE PAIEMENT
Mode de paiement : {context['payment_method']}
Paiement sécurisé par Stripe

📞 BESOIN D'AIDE ?
Notre équipe est à votre disposition pour toute question.

Merci de votre confiance !
L'équipe {context['company_name']}

---
Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
        """
        
        # Corps de l'email en HTML (optionnel mais recommandé)
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #00357a 0%, #0066cc 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }}
        .content {{
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .detail-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }}
        .detail-label {{
            color: #6c757d;
            font-weight: 500;
        }}
        .detail-value {{
            color: #00357a;
            font-weight: bold;
        }}
        .amount {{
            font-size: 24px;
            color: #00357a;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }}
        .button {{
            display: inline-block;
            background: #00357a;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }}
        .steps {{
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #00357a;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Paiement Confirmé !</h1>
        <p>Votre abonnement est maintenant actif</p>
    </div>
    
    <div class="content">
        <p>Bonjour <strong>{member.full_name}</strong>,</p>
        <p>Nous vous confirmons que votre paiement a été effectué avec succès !</p>
        
        <div class="card">
            <h3 style="color: #00357a; margin-top: 0;">📋 Détails de votre abonnement</h3>
            <div class="detail-row">
                <span class="detail-label">Plan</span>
                <span class="detail-value">{subscription.plan.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Durée</span>
                <span class="detail-value">{subscription.plan.duration_days} jours</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date de début</span>
                <span class="detail-value">{context['start_date']}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date de fin</span>
                <span class="detail-value">{context['end_date']}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Numéro de facture</span>
                <span class="detail-value">{context['invoice_number']}</span>
            </div>
            <div class="amount">
                {float(subscription.amount_paid):.3f} TND
            </div>
        </div>
        
        <div class="steps">
            <h3 style="color: #00357a; margin-top: 0;">🎉 Prochaines étapes</h3>
            <ol style="margin: 0; padding-left: 20px;">
                <li>Téléchargez votre facture depuis votre espace membre</li>
                <li>Réservez vos cours collectifs</li>
                <li>Consultez vos programmes d'entraînement</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="{settings.FRONTEND_URL}/portal/invoices" class="button">📄 Voir ma facture</a>
            <a href="{settings.FRONTEND_URL}/portal/dashboard" class="button">🏠 Mon espace</a>
        </div>
        
        <div class="card" style="margin-top: 30px;">
            <h4 style="color: #00357a; margin-top: 0;">💳 Informations de paiement</h4>
            <p style="margin: 5px 0;"><strong>Mode de paiement :</strong> {context['payment_method']}</p>
            <p style="margin: 5px 0;"><strong>Sécurité :</strong> Paiement sécurisé par Stripe</p>
        </div>
        
        <p style="margin-top: 30px; text-align: center;">
            <strong>Besoin d'aide ?</strong><br>
            Notre équipe est à votre disposition pour toute question.
        </p>
    </div>
    
    <div class="footer">
        <p>Merci de votre confiance !<br>L'équipe {context['company_name']}</p>
        <p>Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.</p>
    </div>
</body>
</html>
        """
        
        # Créer l'email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[member.email]
        )
        
        # Ajouter la version HTML
        email.attach_alternative(html_content, "text/html")
        
        # Envoyer l'email
        email.send(fail_silently=False)
        
        logger.info(f"✅ Email de confirmation envoyé à {member.email} pour subscription {subscription.id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur envoi email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
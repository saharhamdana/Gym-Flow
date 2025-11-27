# backend/billing/pdf_generator.py

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from django.conf import settings
import os
from datetime import datetime

def generate_invoice_pdf(invoice):
    """
    Générer un PDF professionnel pour une facture
    
    Args:
        invoice: Instance du modèle Invoice
    
    Returns:
        str: Chemin relatif du fichier PDF généré
    """
    # Créer le dossier si nécessaire
    pdf_dir = os.path.join(settings.MEDIA_ROOT, 'invoices', 'pdfs')
    os.makedirs(pdf_dir, exist_ok=True)
    
    # Nom du fichier
    filename = f"invoice_{invoice.invoice_number.replace('/', '_')}.pdf"
    filepath = os.path.join(pdf_dir, filename)
    
    # Créer le document PDF
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # ===== STYLES PERSONNALISÉS =====
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#00357a'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#00357a'),
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 10
    
    # ===== EN-TÊTE FACTURE =====
    story.append(Paragraph("<b>GYMFLOW</b>", title_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Numéro de facture et date
    invoice_info = f"""
    <b>FACTURE N° {invoice.invoice_number}</b><br/>
    Date d'émission: {invoice.issue_date.strftime('%d/%m/%Y')}<br/>
    Date d'échéance: {invoice.due_date.strftime('%d/%m/%Y')}
    """
    story.append(Paragraph(invoice_info, heading_style))
    story.append(Spacer(1, 1*cm))
    
    # ===== INFORMATIONS SOCIÉTÉ / CLIENT =====
    info_data = [
        [
            Paragraph(f"<b>De:</b><br/>{invoice.company_name}<br/>{invoice.company_address}<br/>TVA: {invoice.company_tax_id or 'N/A'}", normal_style),
            Paragraph(f"<b>À:</b><br/>{invoice.customer_name}<br/>{invoice.customer_email}<br/>{invoice.customer_address or 'Adresse non fournie'}", normal_style)
        ]
    ]
    
    info_table = Table(info_data, colWidths=[9*cm, 9*cm])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#f0f0f0')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#f0f0f0')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 1*cm))
    
    # ===== LIGNES DE FACTURE =====
    line_items_data = [
        [
            Paragraph('<b>Description</b>', normal_style),
            Paragraph('<b>Qté</b>', normal_style),
            Paragraph('<b>Prix Unit. (TND)</b>', normal_style),
            Paragraph('<b>Total (TND)</b>', normal_style)
        ]
    ]
    
    for item in invoice.line_items:
        line_items_data.append([
            Paragraph(item['description'], normal_style),
            Paragraph(str(item.get('quantity', 1)), normal_style),
            Paragraph(f"{float(item['unit_price']):.3f}", normal_style),
            Paragraph(f"{float(item['total']):.3f}", normal_style)
        ])
    
    line_items_table = Table(line_items_data, colWidths=[9*cm, 2*cm, 3.5*cm, 3.5*cm])
    line_items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00357a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
    ]))
    story.append(line_items_table)
    story.append(Spacer(1, 0.5*cm))
    
    # ===== TOTAUX =====
    totals_data = [
        ['', '', Paragraph('<b>Sous-total HT:</b>', normal_style), Paragraph(f"{float(invoice.amount):.3f} TND", normal_style)],
        ['', '', Paragraph(f'<b>TVA ({invoice.tax_rate}%):</b>', normal_style), Paragraph(f"{float(invoice.tax_amount):.3f} TND", normal_style)],
        ['', '', Paragraph('<b>TOTAL TTC:</b>', heading_style), Paragraph(f"<b>{float(invoice.total_amount):.3f} TND</b>", heading_style)]
    ]
    
    totals_table = Table(totals_data, colWidths=[9*cm, 2*cm, 3.5*cm, 3.5*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (2, 2), (-1, 2), 2, colors.HexColor('#00357a')),
        ('BACKGROUND', (2, 2), (-1, 2), colors.HexColor('#f0f0f0')),
        ('PADDING', (2, 2), (-1, 2), 10),
    ]))
    story.append(totals_table)
    
    # ===== STATUT PAIEMENT =====
    if invoice.status == 'PAID':
        story.append(Spacer(1, 1*cm))
        paid_text = f"""
        <b>✓ FACTURE PAYÉE</b><br/>
        Méthode: {invoice.payment_method}<br/>
        Date: {invoice.payment_date.strftime('%d/%m/%Y à %H:%M') if invoice.payment_date else 'N/A'}
        """
        paid_style = ParagraphStyle(
            'Paid',
            parent=normal_style,
            textColor=colors.green,
            fontSize=12,
            alignment=TA_CENTER
        )
        story.append(Paragraph(paid_text, paid_style))
    
    # ===== NOTES =====
    if invoice.notes:
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("<b>Notes:</b>", heading_style))
        story.append(Paragraph(invoice.notes, normal_style))
    
    # ===== FOOTER =====
    story.append(Spacer(1, 2*cm))
    footer_style = ParagraphStyle(
        'Footer',
        parent=normal_style,
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    story.append(Paragraph("Merci de votre confiance | GymFlow - Votre partenaire fitness", footer_style))
    story.append(Paragraph("Pour toute question, contactez-nous à contact@gymflow.com", footer_style))
    
    # Générer le PDF
    doc.build(story)
    
    # Retourner le chemin relatif pour la base de données
    return os.path.join('invoices', 'pdfs', filename)
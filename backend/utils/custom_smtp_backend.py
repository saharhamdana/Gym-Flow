# backend/utils/custom_smtp_backend.py
import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend as SMTPBackend
from django.conf import settings


class CustomSMTPBackend(SMTPBackend):
    """
    Backend SMTP personnalisé qui ignore la vérification SSL en développement
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # En développement, créer un contexte SSL sans vérification
        if settings.DEBUG:
            self.ssl_context = ssl.create_default_context()
            self.ssl_context.check_hostname = False
            self.ssl_context.verify_mode = ssl.CERT_NONE
        else:
            self.ssl_context = None

    def open(self):
        """
        Établir la connexion SMTP - VERSION CORRIGÉE
        """
        if self.connection:
            return False
        
        try:
            # Configuration de connexion
            connection_params = {}
            if self.timeout:
                connection_params['timeout'] = self.timeout
            
            # Si on a un contexte SSL personnalisé
            if self.ssl_context and (self.use_tls or self.use_ssl):
                # Si on utilise SSL directement (port 465)
                if self.use_ssl:
                    self.connection = smtplib.SMTP_SSL(
                        self.host,
                        self.port,
                        **connection_params,
                        context=self.ssl_context
                    )
                else:
                    # Connexion SMTP normale (port 587)
                    self.connection = smtplib.SMTP(
                        self.host,
                        self.port,
                        **connection_params
                    )
                
                # Si on utilise STARTTLS
                if self.use_tls:
                    self.connection.ehlo()
                    self.connection.starttls(context=self.ssl_context)
                    self.connection.ehlo()
            else:
                # Comportement normal sans contexte SSL personnalisé
                if self.use_ssl:
                    self.connection = smtplib.SMTP_SSL(
                        self.host,
                        self.port,
                        **connection_params
                    )
                else:
                    self.connection = smtplib.SMTP(
                        self.host,
                        self.port,
                        **connection_params
                    )
                
                if self.use_tls:
                    self.connection.ehlo()
                    self.connection.starttls()
                    self.connection.ehlo()
            
            # Authentification
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
            
        except Exception:
            if not self.fail_silently:
                raise
            return False
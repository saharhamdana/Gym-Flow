from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

def list_urls(urlpatterns, prefix=''):
    """Liste récursivement toutes les URLs"""
    urls = []
    for pattern in urlpatterns:
        if isinstance(pattern, URLPattern):
            urls.append(prefix + str(pattern.pattern))
        elif isinstance(pattern, URLResolver):
            urls.extend(list_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
    return urls

print("\n" + "="*80)
print("📋 URLS DISPONIBLES DANS DJANGO")
print("="*80 + "\n")

resolver = get_resolver()
all_urls = sorted(list_urls(resolver.url_patterns))

# Filtrer les URLs API
api_urls = [url for url in all_urls if 'api/' in url or 'coaching/' in url or 'members/' in url]

print("🔹 URLs de l'API:\n")
for url in api_urls:
    # Nettoyer l'affichage
    clean_url = url.replace('^', '').replace('$', '').replace('\\', '')
    if clean_url and not clean_url.startswith('__'):
        print(f"  • {clean_url}")

print("\n" + "="*80)

# Vérifier les URLs spécifiques qui posent problème
print("\n🔍 VÉRIFICATION DES ENDPOINTS PROBLÉMATIQUES:\n")

required_urls = [
    'api/members/',
    'api/coaching/members/',
    'api/coaching/programs/',
    'api/coaching/coach/dashboard-stats/',
    'api/coaching/coach/upcoming-sessions/',
    'api/coaching/coach/my-members/',
]

for required in required_urls:
    # Vérifier si l'URL existe
    exists = any(required in url for url in all_urls)
    status = "✅ Trouvé" if exists else "❌ MANQUANT"
    print(f"  {status}: {required}")

print("\n" + "="*80)
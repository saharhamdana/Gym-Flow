# backend/authentication/management/commands/generate_realistic_data.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta, datetime
import random
from decimal import Decimal

from authentication.models import User, GymCenter
from members.models import Member, MemberMeasurement
from subscriptions.models import SubscriptionPlan, Subscription
from bookings.models import Room, CourseType, Course, Booking


class Command(BaseCommand):
    help = 'Génère une base de données réaliste pour la démo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--full',
            action='store_true',
            help='Générer toutes les données (plus long)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Génération de données réalistes...'))
        
        with transaction.atomic():
            # 1. SuperAdmin
            self.create_superadmin()
            
            # 2. Centres de fitness
            centers = self.create_gym_centers()
            
            # 3. Pour chaque centre
            for center in centers:
                self.stdout.write(f'\n📍 Génération des données pour {center.name}...')
                
                # Staff (Admins, Coachs, Réceptionnistes)
                staff = self.create_staff(center)
                
                # Plans d'abonnement
                plans = self.create_subscription_plans(center)
                
                # Membres
                num_members = 30 if options['full'] else 15
                members = self.create_members(center, num_members)
                
                # Abonnements
                self.create_subscriptions(center, members, plans)
                
                # Salles
                rooms = self.create_rooms(center)
                
                # Types de cours
                course_types = self.create_course_types(center)
                
                # Cours
                coaches = [s for s in staff if s.role == 'COACH']
                courses = self.create_courses(center, coaches, rooms, course_types)
                
                # Réservations
                self.create_bookings(center, members, courses)
                
                # Mesures physiques
                if options['full']:
                    self.create_measurements(members)
        
        self.stdout.write(self.style.SUCCESS('\n✅ Génération terminée avec succès!'))
        self.print_summary()

    def create_superadmin(self):
        """Créer le SuperAdmin"""
        user, created = User.objects.get_or_create(
            username='superadmin',
            defaults={
                'email': 'superadmin@gymflow.com',
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'ADMIN',
                'is_superuser': True,
                'is_staff': True,
                'is_active': True,
            }
        )
        if created:
            user.set_password('superadmin123')
            user.save()
            self.stdout.write(self.style.SUCCESS('✓ SuperAdmin créé'))

    def create_gym_centers(self):
        """Créer les centres de fitness"""
        centers_data = [
            {
                'name': 'PowerFit Tunis',
                'subdomain': 'powerfit',
                'email': 'contact@powerfit.tn',
                'phone': '+216 71 123 456',
                'address': '123 Avenue Habib Bourguiba',
                'city': 'Tunis',
                'status': 'ACTIVE',
                'subscription_plan': 'PRO',
                'subscription_start': timezone.now().date() - timedelta(days=180),
                'subscription_end': timezone.now().date() + timedelta(days=185),
                'max_members': 200,
                'max_coaches': 20,
                'max_admins': 5,
            },
            {
                'name': 'MoveUp Fitness Sousse',
                'subdomain': 'moveup',
                'email': 'info@moveup.tn',
                'phone': '+216 73 234 567',
                'address': '456 Rue de la République',
                'city': 'Sousse',
                'status': 'ACTIVE',
                'subscription_plan': 'BASIC',
                'subscription_start': timezone.now().date() - timedelta(days=60),
                'subscription_end': timezone.now().date() + timedelta(days=30),
                'max_members': 50,
                'max_coaches': 5,
                'max_admins': 2,
            },
            {
                'name': 'Elite Gym Sfax',
                'subdomain': 'elitegym',
                'email': 'contact@elitegym.tn',
                'phone': '+216 74 345 678',
                'address': '789 Avenue de la Liberté',
                'city': 'Sfax',
                'status': 'TRIAL',
                'subscription_plan': 'BASIC',
                'subscription_start': timezone.now().date() - timedelta(days=7),
                'subscription_end': timezone.now().date() + timedelta(days=7),
                'max_members': 50,
                'max_coaches': 5,
                'max_admins': 2,
            },
        ]
        
        centers = []
        for data in centers_data:
            center, created = GymCenter.objects.get_or_create(
                subdomain=data['subdomain'],
                defaults=data
            )
            centers.append(center)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Centre créé: {center.name}'))
        
        return centers

    def create_staff(self, center):
        """Créer le personnel d'un centre"""
        staff_data = [
            # Admin
            {
                'username': f'admin_{center.subdomain}',
                'email': f'admin@{center.subdomain}.tn',
                'first_name': 'Ahmed',
                'last_name': 'Ben Ali',
                'role': 'ADMIN',
                'phone': '+216 20 111 222',
            },
            # Réceptionniste
            {
                'username': f'receptionist_{center.subdomain}',
                'email': f'reception@{center.subdomain}.tn',
                'first_name': 'Fatma',
                'last_name': 'Trabelsi',
                'role': 'RECEPTIONIST',
                'phone': '+216 20 222 333',
            },
            # Coachs
            {
                'username': f'coach1_{center.subdomain}',
                'email': f'coach1@{center.subdomain}.tn',
                'first_name': 'Mohamed',
                'last_name': 'Gharbi',
                'role': 'COACH',
                'phone': '+216 20 333 444',
            },
            {
                'username': f'coach2_{center.subdomain}',
                'email': f'coach2@{center.subdomain}.tn',
                'first_name': 'Sarah',
                'last_name': 'Bouzid',
                'role': 'COACH',
                'phone': '+216 20 444 555',
            },
            {
                'username': f'coach3_{center.subdomain}',
                'email': f'coach3@{center.subdomain}.tn',
                'first_name': 'Karim',
                'last_name': 'Mansour',
                'role': 'COACH',
                'phone': '+216 20 555 666',
            },
        ]
        
        staff = []
        for data in staff_data:
            data['tenant_id'] = center.tenant_id
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults=data
            )
            if created:
                user.set_password('password123')
                user.save()
                
                # Définir le propriétaire du centre
                if data['role'] == 'ADMIN' and not center.owner:
                    center.owner = user
                    center.save()
            
            staff.append(user)
        
        self.stdout.write(f'  ✓ {len(staff)} membres du staff créés')
        return staff

    def create_subscription_plans(self, center):
        """Créer les plans d'abonnement"""
        plans_data = [
            {'name': 'Mensuel', 'duration_days': 30, 'price': Decimal('49.00')},
            {'name': 'Trimestriel', 'duration_days': 90, 'price': Decimal('129.00')},
            {'name': 'Semestriel', 'duration_days': 180, 'price': Decimal('239.00')},
            {'name': 'Annuel', 'duration_days': 365, 'price': Decimal('449.00')},
        ]
        
        plans = []
        for data in plans_data:
            data['tenant_id'] = center.tenant_id
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=data['name'],
                tenant_id=center.tenant_id,
                defaults=data
            )
            plans.append(plan)
        
        self.stdout.write(f'  ✓ {len(plans)} plans d\'abonnement créés')
        return plans

    def create_members(self, center, count=15):
        """Créer des membres réalistes"""
        first_names_m = ['Mohamed', 'Ahmed', 'Ali', 'Karim', 'Youssef', 'Mehdi', 'Amine', 'Bilel', 'Houssem', 'Malek']
        last_names = ['Ben Ali', 'Trabelsi', 'Gharbi', 'Bouzid', 'Mansour', 'Khelifi', 'Jebali', 'Sassi', 'Hamdi', 'Romdhane']
        first_names_f = ['Fatma', 'Sarah', 'Amira', 'Leila', 'Nour', 'Salma', 'Ines', 'Mariem', 'Yasmine', 'Hela']
        
        members = []
        for i in range(count):
            gender = 'M' if i % 2 == 0 else 'F'
            first_name = random.choice(first_names_m if gender == 'M' else first_names_f)
            last_name = random.choice(last_names)
            
            # Créer l'utilisateur
            username = f'member_{center.subdomain}_{i+1}'
            email = f'{username}@test.tn'
            
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'MEMBER',
                    'tenant_id': center.tenant_id,
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()
            
            # Créer le profil membre
            birth_year = random.randint(1980, 2005)
            age = 2025 - birth_year
            
            member, created = Member.objects.get_or_create(
                email=email,
                defaults={
                    'user': user,
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': f'+216 {random.randint(20,99)} {random.randint(100,999)} {random.randint(100,999)}',
                    'date_of_birth': datetime(birth_year, random.randint(1,12), random.randint(1,28)).date(),
                    'gender': gender,
                    'address': f'{random.randint(1,200)} Rue {random.choice(["de la Liberté", "de la République", "Habib Bourguiba", "du 7 Novembre"])}',
                    'emergency_contact_name': f'{random.choice(first_names_m + first_names_f)} {random.choice(last_names)}',
                    'emergency_contact_phone': f'+216 {random.randint(20,99)} {random.randint(100,999)} {random.randint(100,999)}',
                    'height': Decimal(str(random.randint(155, 195))),
                    'weight': Decimal(str(random.randint(55, 105))),
                    'status': 'ACTIVE' if random.random() > 0.2 else 'INACTIVE',
                    'tenant_id': center.tenant_id,
                }
            )
            members.append(member)
        
        self.stdout.write(f'  ✓ {len(members)} membres créés')
        return members

    def create_subscriptions(self, center, members, plans):
        """Créer les abonnements"""
        count = 0
        for member in members:
            if member.status == 'ACTIVE' or random.random() > 0.3:
                plan = random.choice(plans)
                
                # Date de début aléatoire dans les 6 derniers mois
                days_ago = random.randint(0, 180)
                start_date = timezone.now().date() - timedelta(days=days_ago)
                
                subscription, created = Subscription.objects.get_or_create(
                    member=member,
                    plan=plan,
                    start_date=start_date,
                    defaults={
                        'end_date': start_date + timedelta(days=plan.duration_days),
                        'status': 'ACTIVE' if days_ago < plan.duration_days else 'EXPIRED',
                        'amount_paid': plan.price,
                        'payment_date': timezone.now() - timedelta(days=days_ago),
                        'payment_method': random.choice(['Espèces', 'Carte Bancaire', 'Virement', 'Chèque']),
                        'tenant_id': center.tenant_id,
                    }
                )
                
                if created and subscription.status == 'ACTIVE':
                    member.activate()
                    count += 1
        
        self.stdout.write(f'  ✓ {count} abonnements créés')

    def create_rooms(self, center):
        """Créer les salles"""
        rooms_data = [
            {'name': 'Salle Cardio', 'capacity': 20, 'description': 'Équipée de tapis de course, vélos et rameurs'},
            {'name': 'Salle Musculation', 'capacity': 30, 'description': 'Machines de musculation et poids libres'},
            {'name': 'Salle Yoga', 'capacity': 15, 'description': 'Espace calme pour yoga et méditation'},
            {'name': 'Studio Collectif', 'capacity': 25, 'description': 'Pour cours collectifs (Zumba, Step, etc.)'},
        ]
        
        rooms = []
        for data in rooms_data:
            data['tenant_id'] = center.tenant_id
            room, created = Room.objects.get_or_create(
                name=data['name'],
                tenant_id=center.tenant_id,
                defaults=data
            )
            rooms.append(room)
        
        self.stdout.write(f'  ✓ {len(rooms)} salles créées')
        return rooms

    def create_course_types(self, center):
        """Créer les types de cours"""
        types_data = [
            {'name': 'Yoga', 'description': 'Yoga doux et relaxation', 'color': '#10b981', 'duration_minutes': 60},
            {'name': 'Zumba', 'description': 'Danse fitness énergique', 'color': '#f59e0b', 'duration_minutes': 45},
            {'name': 'Musculation', 'description': 'Renforcement musculaire', 'color': '#ef4444', 'duration_minutes': 90},
            {'name': 'Cardio Training', 'description': 'Entraînement cardio intensif', 'color': '#3b82f6', 'duration_minutes': 45},
            {'name': 'Pilates', 'description': 'Renforcement et posture', 'color': '#8b5cf6', 'duration_minutes': 60},
            {'name': 'CrossFit', 'description': 'Entraînement fonctionnel intense', 'color': '#dc2626', 'duration_minutes': 60},
        ]
        
        course_types = []
        for data in types_data:
            data['tenant_id'] = center.tenant_id
            course_type, created = CourseType.objects.get_or_create(
                name=data['name'],
                tenant_id=center.tenant_id,
                defaults=data
            )
            course_types.append(course_type)
        
        self.stdout.write(f'  ✓ {len(course_types)} types de cours créés')
        return course_types

    def create_courses(self, center, coaches, rooms, course_types):
        """Créer les cours (2 semaines passées + 2 semaines futures)"""
        if not coaches:
            self.stdout.write(self.style.WARNING('  ⚠ Pas de coachs, cours non créés'))
            return []
        
        courses = []
        today = timezone.now().date()
        
        # Générer des cours pour -14 jours à +14 jours
        for day_offset in range(-14, 15):
            current_date = today + timedelta(days=day_offset)
            
            # 3-5 cours par jour
            num_courses = random.randint(3, 5)
            
            for _ in range(num_courses):
                coach = random.choice(coaches)
                room = random.choice(rooms)
                course_type = random.choice(course_types)
                
                # Horaires réalistes
                hour = random.choice([8, 10, 12, 14, 16, 18, 20])
                start_time = datetime.strptime(f'{hour}:00', '%H:%M').time()
                end_time = datetime.strptime(f'{hour + 1}:30', '%H:%M').time()
                
                # Statut selon la date
                if current_date < today:
                    status = 'COMPLETED'
                elif current_date == today:
                    status = 'ONGOING' if hour <= timezone.now().hour else 'SCHEDULED'
                else:
                    status = 'SCHEDULED'
                
                course, created = Course.objects.get_or_create(
                    coach=coach,
                    date=current_date,
                    start_time=start_time,
                    tenant_id=center.tenant_id,
                    defaults={
                        'course_type': course_type,
                        'room': room,
                        'title': f'{course_type.name} avec {coach.first_name}',
                        'description': course_type.description,
                        'end_time': end_time,
                        'max_participants': min(room.capacity, random.randint(10, 20)),
                        'status': status,
                    }
                )
                
                if created:
                    courses.append(course)
        
        self.stdout.write(f'  ✓ {len(courses)} cours créés')
        return courses

    def create_bookings(self, center, members, courses):
        """Créer les réservations"""
        active_members = [m for m in members if m.status == 'ACTIVE']
        count = 0
        
        for course in courses:
            # Nombre de réservations par cours (50-90% de la capacité)
            num_bookings = int(course.max_participants * random.uniform(0.5, 0.9))
            
            # Sélectionner aléatoirement des membres
            selected_members = random.sample(
                active_members,
                min(num_bookings, len(active_members))
            )
            
            for member in selected_members:
                # Statut selon la date du cours
                if course.date < timezone.now().date():
                    status = 'COMPLETED' if random.random() > 0.1 else 'NO_SHOW'
                    checked_in = status == 'COMPLETED'
                else:
                    status = 'CONFIRMED'
                    checked_in = False
                
                booking, created = Booking.objects.get_or_create(
                    course=course,
                    member=member,
                    defaults={
                        'status': status,
                        'checked_in': checked_in,
                        'check_in_time': timezone.now() if checked_in else None,
                        'tenant_id': center.tenant_id,
                    }
                )
                
                if created:
                    count += 1
        
        self.stdout.write(f'  ✓ {count} réservations créées')

    def create_measurements(self, members):
        """Créer l'historique des mesures physiques"""
        count = 0
        for member in random.sample(members, min(10, len(members))):
            # 3-6 mesures par membre sur 6 mois
            num_measurements = random.randint(3, 6)
            
            base_weight = float(member.weight) if member.weight else random.uniform(60, 90)
            
            for i in range(num_measurements):
                days_ago = (num_measurements - i) * 30
                measurement_date = timezone.now().date() - timedelta(days=days_ago)
                
                # Progression réaliste
                weight_change = -0.5 * i if random.random() > 0.3 else 0.2 * i
                
                MemberMeasurement.objects.create(
                    member=member,
                    date=measurement_date,
                    weight=Decimal(str(base_weight + weight_change)),
                    body_fat_percentage=Decimal(str(random.uniform(15, 30))),
                    muscle_mass=Decimal(str(random.uniform(30, 50))),
                    chest=Decimal(str(random.uniform(85, 110))),
                    waist=Decimal(str(random.uniform(70, 95))),
                    hips=Decimal(str(random.uniform(85, 110))),
                )
                count += 1
        
        self.stdout.write(f'  ✓ {count} mesures physiques créées')

    def print_summary(self):
        """Afficher le résumé"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📊 RÉSUMÉ DES DONNÉES GÉNÉRÉES'))
        self.stdout.write('='*60)
        
        self.stdout.write(f'\n🏢 Centres: {GymCenter.objects.count()}')
        self.stdout.write(f'👥 Utilisateurs: {User.objects.count()}')
        self.stdout.write(f'   - SuperAdmin: {User.objects.filter(is_superuser=True).count()}')
        self.stdout.write(f'   - Admins: {User.objects.filter(role="ADMIN", is_superuser=False).count()}')
        self.stdout.write(f'   - Coachs: {User.objects.filter(role="COACH").count()}')
        self.stdout.write(f'   - Réceptionnistes: {User.objects.filter(role="RECEPTIONIST").count()}')
        self.stdout.write(f'   - Membres: {User.objects.filter(role="MEMBER").count()}')
        
        self.stdout.write(f'\n💪 Membres: {Member.objects.count()}')
        self.stdout.write(f'   - Actifs: {Member.objects.filter(status="ACTIVE").count()}')
        self.stdout.write(f'   - Inactifs: {Member.objects.filter(status="INACTIVE").count()}')
        
        self.stdout.write(f'\n💳 Plans d\'abonnement: {SubscriptionPlan.objects.count()}')
        self.stdout.write(f'📝 Abonnements: {Subscription.objects.count()}')
        self.stdout.write(f'   - Actifs: {Subscription.objects.filter(status="ACTIVE").count()}')
        self.stdout.write(f'   - Expirés: {Subscription.objects.filter(status="EXPIRED").count()}')
        
        self.stdout.write(f'\n🏋️ Salles: {Room.objects.count()}')
        self.stdout.write(f'📚 Types de cours: {CourseType.objects.count()}')
        self.stdout.write(f'📅 Cours: {Course.objects.count()}')
        self.stdout.write(f'   - Planifiés: {Course.objects.filter(status="SCHEDULED").count()}')
        self.stdout.write(f'   - Complétés: {Course.objects.filter(status="COMPLETED").count()}')
        
        self.stdout.write(f'\n🎫 Réservations: {Booking.objects.count()}')
        self.stdout.write(f'   - Confirmées: {Booking.objects.filter(status="CONFIRMED").count()}')
        self.stdout.write(f'   - Complétées: {Booking.objects.filter(status="COMPLETED").count()}')
        
        self.stdout.write(f'\n📏 Mesures physiques: {MemberMeasurement.objects.count()}')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('\n🎉 IDENTIFIANTS DE CONNEXION'))
        self.stdout.write('='*60)
        
        self.stdout.write('\n🔐 SuperAdmin:')
        self.stdout.write('   Username: superadmin')
        self.stdout.write('   Password: superadmin123')
        
        for center in GymCenter.objects.all():
            self.stdout.write(f'\n📍 {center.name}:')
            self.stdout.write(f'   Admin: admin_{center.subdomain} / password123')
            self.stdout.write(f'   Coach: coach1_{center.subdomain} / password123')
            self.stdout.write(f'   Membre: member_{center.subdomain}_1 / password123')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('✅ Tout est prêt pour la démo!'))
        self.stdout.write('='*60 + '\n')
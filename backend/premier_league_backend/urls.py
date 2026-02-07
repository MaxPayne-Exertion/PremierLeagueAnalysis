from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'players', PlayerViewSet, basename='player')

urlpatterns = [
    path('api/', include(router.urls)),
]

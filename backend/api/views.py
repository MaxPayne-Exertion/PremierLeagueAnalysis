from rest_framework import viewsets, filters
from .models import Team, Player
from .serializers import TeamSerializer, PlayerSerializer

class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    
    def get_queryset(self):
        queryset = Team.objects.all()
        season = self.request.query_params.get('season', '2023-24')
        if season:
            queryset = queryset.filter(season=season)
        return queryset.order_by('-points')

class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'team__team_name']
    
    def get_queryset(self):
        queryset = Player.objects.all()
        season = self.request.query_params.get('season', '2023-24')
        if season:
            queryset = queryset.filter(season=season)
        return queryset.order_by('-goals')

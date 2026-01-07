from django.db import models

class Team(models.Model):
    season = models.CharField(max_length=10, default='2023-24')
    team_name = models.CharField(max_length=100)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    xg_for = models.FloatField(default=0.0)
    xg_against = models.FloatField(default=0.0)
    points = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['season', 'team_name']

    def __str__(self):
        return f"{self.team_name} ({self.season})"

class Player(models.Model):
    season = models.CharField(max_length=10, default='2023-24')
    player_id = models.CharField(max_length=100) # External ID
    name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, related_name='players', on_delete=models.CASCADE)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    flag_url = models.URLField(max_length=500, blank=True, null=True)
    position = models.CharField(max_length=50)
    age = models.IntegerField(default=0)
    
    # Stats
    matches_played = models.IntegerField(default=0)
    minutes_played = models.IntegerField(default=0)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    xg = models.FloatField(default=0.0)
    xag = models.FloatField(default=0.0)
    progressive_carries = models.IntegerField(default=0)
    progressive_passes = models.IntegerField(default=0)
    tackles_won = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['season', 'player_id']

    def __str__(self):
        return f"{self.name} ({self.team.team_name}) - {self.season}"

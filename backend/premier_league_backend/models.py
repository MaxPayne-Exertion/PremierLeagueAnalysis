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
    goal_difference = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    manager = models.CharField(max_length=100, blank=True, null=True)
    captain = models.CharField(max_length=100, blank=True, null=True)
    stadium = models.CharField(max_length=100,blank=True, null=True)
    top_scorer_all_time = models.CharField(max_length=100, blank=True, null=True)
    premier_league_titles = models.CharField(max_length=50, blank=True, null=True)
    fa_cup_titles = models.CharField(max_length=50, blank=True, null=True)
    league_cup_titles = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        unique_together = ['season', 'team_name']

    def __str__(self):
        return f"{self.team_name} ({self.season})"


class Player(models.Model):
    season = models.CharField(max_length=10, default="2023-24")

    player_id = models.CharField(max_length=100)
    team_id_external = models.CharField(max_length=100, blank=True, null=True)

    name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    position = models.CharField(max_length=50)

    # Basic
    appearances = models.IntegerField(default=0)
    minutesPlayed = models.IntegerField(default=0)

    # Attacking
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    expectedGoals = models.FloatField(default=0.0)
    totalShots = models.IntegerField(default=0)
    shotsOnTarget = models.IntegerField(default=0)
    blockedShots = models.IntegerField(default=0)
    bigChancesMissed = models.IntegerField(default=0)
    goalConversionPercentage = models.FloatField(default=0.0)
    hitWoodwork = models.IntegerField(default=0)
    offsides = models.IntegerField(default=0)
    passToAssist = models.IntegerField(default=0)

    # Passing
    accuratePasses = models.IntegerField(default=0)
    accuratePassesPercentage = models.FloatField(default=0.0)
    keyPasses = models.IntegerField(default=0)
    accurateFinalThirdPasses = models.IntegerField(default=0)
    accurateCrosses = models.IntegerField(default=0)
    accurateCrossesPercentage = models.FloatField(default=0.0)
    accurateLongBalls = models.IntegerField(default=0)
    accurateLongBallsPercentage = models.FloatField(default=0.0)

    # Duels & Defense
    tackles = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    clearances = models.IntegerField(default=0)
    dribbledPast = models.IntegerField(default=0)

    groundDuelsWon = models.IntegerField(default=0)
    groundDuelsWonPercentage = models.FloatField(default=0.0)
    aerialDuelsWon = models.IntegerField(default=0)
    aerialDuelsWonPercentage = models.FloatField(default=0.0)
    totalDuelsWon = models.IntegerField(default=0)
    totalDuelsWonPercentage = models.FloatField(default=0.0)

    successfulDribbles = models.IntegerField(default=0)
    successfulDribblesPercentage = models.FloatField(default=0.0)

    # Discipline
    yellowCards = models.IntegerField(default=0)
    redCards = models.IntegerField(default=0)
    fouls = models.IntegerField(default=0)
    wasFouled = models.IntegerField(default=0)
    dispossessed = models.IntegerField(default=0)

    # Goalkeeping
    saves = models.IntegerField(default=0)
    savedShotsFromInsideTheBox = models.IntegerField(default=0)
    savedShotsFromOutsideTheBox = models.IntegerField(default=0)
    goalsConceded = models.IntegerField(default=0)
    goalsConcededInsideTheBox = models.IntegerField(default=0)
    goalsConcededOutsideTheBox = models.IntegerField(default=0)
    highClaims = models.IntegerField(default=0)
    runsOut = models.IntegerField(default=0)
    successfulRunsOut = models.IntegerField(default=0)
    punches = models.IntegerField(default=0)

    # Errors
    errorLeadToGoal = models.IntegerField(default=0)
    errorLeadToShot = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["season", "player_id"]

    def __str__(self):
        return f"{self.name} ({self.team.team_name}) - {self.season}"

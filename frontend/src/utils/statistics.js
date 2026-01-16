/**
 * Statistical utility functions for Premier League Analytics
 */

/**
 * Normalize a value to 0-100 scale based on min-max normalization
 * @param {number} value - The value to normalize
 * @param {number} min - Minimum value in the dataset
 * @param {number} max - Maximum value in the dataset
 * @returns {number} Normalized value between 0-100
 */
export const normalizeValue = (value, min, max) => {
    if (max === min) return 50; // If all values are the same, return middle value
    return ((value - min) / (max - min)) * 100;
};

/**
 * Normalize player statistics for radar chart visualization
 * @param {Array} players - Array of all players
 * @param {Object} player - The player to normalize
 * @param {Array} metrics - Array of metric keys to normalize
 * @returns {Object} Normalized player stats
 */
export const normalizePlayerStats = (players, player, metrics = ['goals', 'assists', 'xg', 'progressive_carries', 'progressive_passes']) => {
    const normalized = {};

    metrics.forEach(metric => {
        const values = players.map(p => p[metric] || 0);
        const min = Math.min(...values);
        const max = Math.max(...values);

        normalized[metric] = normalizeValue(player[metric] || 0, min, max);
    });

    return normalized;
};

/**
 * Calculate percentile rank for a player's stat
 * @param {Array} players - Array of all players
 * @param {Object} player - The player to rank
 * @param {string} metric - The metric to rank
 * @returns {number} Percentile (0-100)
 */
export const calculatePercentile = (players, player, metric) => {
    const value = player[metric] || 0;
    const values = players.map(p => p[metric] || 0).sort((a, b) => a - b);

    const rank = values.filter(v => v < value).length;
    return (rank / values.length) * 100;
};

/**
 * Get min and max values for a metric across all players
 * @param {Array} players - Array of all players
 * @param {string} metric - The metric to analyze
 * @returns {Object} Object with min and max values
 */
export const getMetricRange = (players, metric) => {
    const values = players.map(p => p[metric] || 0);
    return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
    };
};

/**
 * Prepare radar chart data with normalized values
 * @param {Array} players - Array of all players
 * @param {Object} player - The player to visualize
 * @returns {Array} Array of radar chart data points
 */
export const prepareRadarData = (players, player) => {
    const metrics = [
        { key: 'goals', label: 'Goals' },
        { key: 'assists', label: 'Assists' },
        { key: 'xg', label: 'xG' },
        { key: 'xag', label: 'xAG' },
        { key: 'progressive_carries', label: 'Prg. Carries' },
        { key: 'progressive_passes', label: 'Prg. Passes' }
    ];

    return metrics.map(metric => {
        const values = players.map(p => p[metric.key] || 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const normalizedValue = normalizeValue(player[metric.key] || 0, min, max);

        return {
            attribute: metric.label,
            value: normalizedValue,
            rawValue: player[metric.key] || 0
        };
    });
};

/**
 * Calculate z-score for a value
 * @param {number} value - The value to score
 * @param {number} mean - Mean of the dataset
 * @param {number} stdDev - Standard deviation of the dataset
 * @returns {number} Z-score
 */
export const calculateZScore = (value, mean, stdDev) => {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
};

/**
 * Calculate standard deviation
 * @param {Array} values - Array of numbers
 * @returns {number} Standard deviation
 */
export const calculateStdDev = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
};

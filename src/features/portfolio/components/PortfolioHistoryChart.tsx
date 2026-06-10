import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Pressable, Platform } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Text as SvgText,
  Line,
  G,
} from 'react-native-svg';
import Card from '@/components/Card';
import { PortfolioHistoryItem } from '../services/portfolioService';
import { formatCurrency, formatCompact } from '@/utils/formatters';
import { formatMonthYear } from '@/utils/dateHelpers';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

interface PortfolioHistoryChartProps {
  history: PortfolioHistoryItem[];
  currencyCode: string;
}

const CHART_HEIGHT = 160;
const PADDING_TOP = 15;
const PADDING_BOTTOM = 25;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 15;

export const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({
  history,
  currencyCode,
}) => {
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2
  );
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Set the default selected point to the last one (current month)
  useEffect(() => {
    if (history && history.length > 0 && selectedIndex === null) {
      setSelectedIndex(history.length - 1);
    }
  }, [history]);

  if (!history || history.length === 0) {
    return (
      <Card padding="lg" style={styles.card}>
        <Text style={styles.title}>Evolução Patrimonial</Text>
        <Text style={styles.emptyText}>Sem dados históricos para exibir.</Text>
      </Card>
    );
  }

  const values = history.map((item) => item.value);
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);

  // Handle case where all values are the same or zero to prevent division by zero
  if (minVal === maxVal) {
    if (maxVal === 0) {
      maxVal = 100;
      minVal = 0;
    } else {
      maxVal = maxVal * 1.5;
      minVal = minVal * 0.5;
    }
  } else {
    // Add 10% padding to the top and bottom of the chart area for visual breathing room
    const diff = maxVal - minVal;
    maxVal = maxVal + diff * 0.15;
    minVal = Math.max(0, minVal - diff * 0.15); // Don't show negative net worth bounds unless necessary
  }

  // Calculate coordinates for points
  const points = history.map((item, i) => {
    const x =
      PADDING_LEFT +
      (i / (history.length - 1)) * (containerWidth - PADDING_LEFT - PADDING_RIGHT);
    const y =
      CHART_HEIGHT -
      PADDING_BOTTOM -
      ((item.value - minVal) / (maxVal - minVal)) *
        (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
    return { x, y, item, index: i };
  });

  // Construct SVG path string for straight segments connecting the coordinates
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Construct closed path for the gradient fill underneath the trendline
  const gradientPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
          CHART_HEIGHT - PADDING_BOTTOM
        ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(
          CHART_HEIGHT - PADDING_BOTTOM
        ).toFixed(1)} Z`
      : '';

  const activePoint = selectedIndex !== null ? points[selectedIndex] : points[points.length - 1];

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  // Generate Y-axis grid values
  const gridLinesCount = 3;
  const gridValues = Array.from({ length: gridLinesCount }).map((_, i) => {
    const val = maxVal - (i / (gridLinesCount - 1)) * (maxVal - minVal);
    const y =
      PADDING_TOP + (i / (gridLinesCount - 1)) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
    return { val, y };
  });

  return (
    <Card padding="lg" style={styles.card}>
      {/* Chart Title and Selected Point Details */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Evolução Patrimonial</Text>
          <Text style={styles.subtitle}>
            {activePoint ? formatMonthYear(activePoint.item.monthKey) : 'Histórico'}
          </Text>
        </View>
        <View style={styles.valueContainer}>
          {activePoint && (
            <Text style={styles.valueText}>
              {formatCurrency(activePoint.item.value, currencyCode)}
            </Text>
          )}
        </View>
      </View>

      {/* SVG Canvas Area */}
      <View style={styles.chartContainer} onLayout={handleLayout}>
        <Svg width={containerWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines and Y-axis text */}
          <G>
            {gridValues.map((line, idx) => (
              <G key={`grid-${idx}`}>
                <Line
                  x1={PADDING_LEFT}
                  y1={line.y}
                  x2={containerWidth - PADDING_RIGHT}
                  y2={line.y}
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={PADDING_LEFT - 8}
                  y={line.y + 4}
                  fill={colors.textSecondary}
                  fontSize={10}
                  fontFamily={fontFamily}
                  fontWeight={fontWeight.medium}
                  textAnchor="end"
                >
                  {formatCompact(line.val)}
                </SvgText>
              </G>
            ))}
          </G>

          {/* Gradient Fill under Line */}
          {gradientPath !== '' && (
            <Path d={gradientPath} fill="url(#areaGrad)" />
          )}

          {/* Trendline */}
          {linePath !== '' && (
            <Path
              d={linePath}
              fill="none"
              stroke={colors.accent}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive touch circles and X-axis Labels */}
          {points.map((p, i) => {
            const isSelected = selectedIndex === i;
            return (
              <G key={`point-${i}`}>
                {/* Horizontal guide line for selected point */}
                {isSelected && (
                  <Line
                    x1={p.x}
                    y1={PADDING_TOP}
                    x2={p.x}
                    y2={CHART_HEIGHT - PADDING_BOTTOM}
                    stroke={colors.border}
                    strokeWidth={1.5}
                  />
                )}

                {/* X-axis Label */}
                <SvgText
                  x={p.x}
                  y={CHART_HEIGHT - 6}
                  fill={isSelected ? colors.textPrimary : colors.textSecondary}
                  fontSize={11}
                  fontFamily={fontFamily}
                  fontWeight={isSelected ? fontWeight.bold : fontWeight.medium}
                  textAnchor="middle"
                >
                  {p.item.month}
                </SvgText>

                {/* Outer highlight circle */}
                {isSelected && (
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={8}
                    fill={colors.accent}
                    opacity={0.3}
                  />
                )}

                {/* Inner solid data circle */}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5 : 4}
                  fill={isSelected ? colors.textPrimary : colors.accent}
                  stroke={colors.accent}
                  strokeWidth={2}
                />
              </G>
            );
          })}
        </Svg>

        {/* Overlay container for standard touch responders to prevent SVG Web errors */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {points.map((p, i) => {
            return (
              <Pressable
                key={`touch-${i}`}
                onPress={() => setSelectedIndex(i)}
                style={() => [
                  styles.touchTarget,
                  {
                    left: p.x - 22,
                    top: p.y - 22,
                  },
                  Platform.OS === 'web' && { cursor: 'pointer' } as any,
                ]}
              />
            );
          })}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: fontSize.lg,
    color: colors.accentLight,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  chartContainer: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  touchTarget: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
});

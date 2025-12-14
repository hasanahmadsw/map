import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';

/**
 * Performance Metrics Utility
 *
 * Provides utilities for tracking and logging performance metrics across services.
 *
 * @example Basic usage:
 * ```typescript
 * import { buildPerformanceMetrics, logPerformanceMetrics, createPerformanceTimer } from 'src/common';
 * import { Logger } from '@nestjs/common';
 *
 * async findAll() {
 *   const timer = createPerformanceTimer();
 *   const startTime = performance.now();
 *
 *   // Your code here
 *   const result = await this.repository.find();
 *
 *   const totalTime = performance.now() - startTime;
 *
 *   const metrics = buildPerformanceMetrics({
 *     functionName: 'findAll',
 *     totalExecutionTime: totalTime,
 *     results: {
 *       total: result.length,
 *       returned: result.length,
 *     },
 *   });
 *
 *   logPerformanceMetrics(this.logger, 'MyService', metrics);
 *   return result;
 * }
 * ```
 *
 * @example With pagination breakdown:
 * ```typescript
 * const countStartTime = performance.now();
 * const total = await countQuery.getCount();
 * const countQueryTime = performance.now() - countStartTime;
 *
 * const dataStartTime = performance.now();
 * const data = await dataQuery.getMany();
 * const dataQueryTime = performance.now() - dataStartTime;
 *
 * const metrics = buildPerformanceMetrics({
 *   functionName: 'findAll',
 *   totalExecutionTime: totalTime,
 *   countQueryTime,
 *   dataQueryTime,
 *   sqlQuery: queryBuilder.getSql(),
 *   results: { total, returned: data.length },
 * });
 * ```
 */

export interface PerformanceMetricsOptions {
  functionName: string;
  totalExecutionTime: number;
  queryBuildTime?: number;
  paginationExecutionTime?: number;
  countQueryTime?: number;
  idsQueryTime?: number;
  dataQueryTime?: number;
  sqlQuery?: string;
  sqlParameters?: Record<string, any>;
  filters?: Record<string, any>;
  results?: {
    total: number;
    returned: number;
    currentPage?: number;
    limit?: number;
  };
  optimizations?: Record<string, any>;
  customMetrics?: Record<string, any>;
}

export interface PerformanceMetrics {
  function: string;
  performance: {
    totalExecutionTime: string;
    queryBuildTime?: string;
    paginationExecutionTime?: string;
    paginationBreakdown?: {
      countQueryTime: string;
      idsQueryTime: string;
      dataQueryTime: string;
      countQueryPercentage: string;
      idsQueryPercentage: string;
      dataQueryPercentage: string;
    };
    analysis: {
      queryBuildPercentage?: string;
      paginationPercentage?: string;
      averageTimePerRecord: string;
      slowestQuery?: string;
    };
  };
  query?: {
    sql: string;
    parameters: Record<string, any>;
  };
  filters?: Record<string, any>;
  results?: {
    total: number;
    returned: number;
    currentPage?: number;
    limit?: number;
  };
  optimizations?: Record<string, any> & {
    recommendations: string[];
  };
  customMetrics?: Record<string, any>;
}

/**
 * Identifies the slowest query step from provided timings
 */
export function getSlowestQuery(countTime: number, idsTime: number, dataTime: number): string {
  const times = [
    { name: 'countQuery', time: countTime },
    { name: 'idsQuery', time: idsTime },
    { name: 'dataQuery', time: dataTime },
  ];
  const slowest = times.reduce((prev, current) => (current.time > prev.time ? current : prev));
  return `${slowest.name} (${slowest.time.toFixed(2)}ms)`;
}

/**
 * Provides performance recommendations based on execution metrics
 */
export function getPerformanceRecommendations(
  executionTime: number,
  totalRecords: number,
  countQueryTime?: number,
  idsQueryTime?: number,
  dataQueryTime?: number,
): string[] {
  const recommendations: string[] = [];

  if (executionTime > 500) {
    recommendations.push('Consider adding database indexes if not already present');
    recommendations.push('Consider implementing query result caching for frequently accessed data');
  }

  if (executionTime > 1000) {
    recommendations.push('Performance is slow - investigate database query execution plans (EXPLAIN ANALYZE)');
    recommendations.push('Consider pagination optimization or reducing JOIN complexity');
  }

  // Specific recommendations based on which query is slow
  if (countQueryTime && countQueryTime > 200) {
    recommendations.push('COUNT query is slow - verify indexes are present and being used');
    recommendations.push('Consider using approximate count for large datasets');
  }

  if (idsQueryTime && idsQueryTime > 200) {
    recommendations.push('IDs query with DISTINCT is slow - LEFT JOIN may be causing performance issues');
    recommendations.push('Consider optimizing the JOIN or using a different pagination strategy');
  }

  if (dataQueryTime && dataQueryTime > 200) {
    recommendations.push('Data fetch query is slow - check if all necessary indexes are present');
    recommendations.push('Consider reducing the number of fields selected or optimizing relations');
  }

  if (totalRecords > 1000 && executionTime > 200) {
    recommendations.push('Large dataset detected - consider adding more specific filters');
    recommendations.push('Consider implementing database-level pagination optimizations');
  }

  // For very small datasets, the overhead might be connection/network related
  if (totalRecords < 10 && executionTime > 300) {
    const overheadPerQuery = Math.max(countQueryTime || 0, idsQueryTime || 0, dataQueryTime || 0);
    if (overheadPerQuery > 200) {
      recommendations.push(
        `High query overhead detected (~${overheadPerQuery.toFixed(0)}ms per query) - this suggests connection/network latency`,
      );
      recommendations.push('⚠️ IMPORTANT: Restart the application to activate connection pooling settings');
      recommendations.push('If overhead persists after restart, check network latency to database');
      recommendations.push('Consider using a database connection closer to the application server');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is within acceptable range');
  }

  return recommendations;
}

/**
 * Builds a comprehensive performance metrics object
 */
export function buildPerformanceMetrics(options: PerformanceMetricsOptions): PerformanceMetrics {
  const {
    functionName,
    totalExecutionTime,
    queryBuildTime = 0,
    paginationExecutionTime = 0,
    countQueryTime = 0,
    idsQueryTime = 0,
    dataQueryTime = 0,
    sqlQuery,
    sqlParameters,
    filters,
    results,
    optimizations = {},
    customMetrics,
  } = options;

  const metrics: PerformanceMetrics = {
    function: functionName,
    performance: {
      totalExecutionTime: `${totalExecutionTime.toFixed(2)}ms`,
      analysis: {
        averageTimePerRecord:
          results?.total && results.total > 0 ? `${(totalExecutionTime / results.total).toFixed(2)}ms` : 'N/A',
      },
    },
  };

  // Add query build time if provided
  if (queryBuildTime > 0) {
    metrics.performance.queryBuildTime = `${queryBuildTime.toFixed(2)}ms`;
    metrics.performance.analysis.queryBuildPercentage = `${((queryBuildTime / totalExecutionTime) * 100).toFixed(1)}%`;
  }

  // Add pagination breakdown if provided
  if (paginationExecutionTime > 0) {
    metrics.performance.paginationExecutionTime = `${paginationExecutionTime.toFixed(2)}ms`;
    metrics.performance.analysis.paginationPercentage = `${((paginationExecutionTime / totalExecutionTime) * 100).toFixed(1)}%`;

    // Add detailed pagination breakdown if all three query times are provided
    if (countQueryTime > 0 || idsQueryTime > 0 || dataQueryTime > 0) {
      const totalPaginationTime = countQueryTime + idsQueryTime + dataQueryTime;
      metrics.performance.paginationBreakdown = {
        countQueryTime: `${countQueryTime.toFixed(2)}ms`,
        idsQueryTime: `${idsQueryTime.toFixed(2)}ms`,
        dataQueryTime: `${dataQueryTime.toFixed(2)}ms`,
        countQueryPercentage:
          totalPaginationTime > 0 ? `${((countQueryTime / totalPaginationTime) * 100).toFixed(1)}%` : '0%',
        idsQueryPercentage:
          totalPaginationTime > 0 ? `${((idsQueryTime / totalPaginationTime) * 100).toFixed(1)}%` : '0%',
        dataQueryPercentage:
          totalPaginationTime > 0 ? `${((dataQueryTime / totalPaginationTime) * 100).toFixed(1)}%` : '0%',
      };

      // Add slowest query identification
      if (countQueryTime > 0 && idsQueryTime > 0 && dataQueryTime > 0) {
        metrics.performance.analysis.slowestQuery = getSlowestQuery(countQueryTime, idsQueryTime, dataQueryTime);
      }
    }
  }

  // Add SQL query information if provided
  if (sqlQuery) {
    metrics.query = {
      sql: sqlQuery,
      parameters: sqlParameters || {},
    };
  }

  // Add filters if provided
  if (filters) {
    metrics.filters = filters;
  }

  // Add results if provided
  if (results) {
    metrics.results = results;
  }

  // Add optimizations with recommendations
  if (results) {
    metrics.optimizations = {
      ...optimizations,
      recommendations: getPerformanceRecommendations(
        totalExecutionTime,
        results.total,
        countQueryTime,
        idsQueryTime,
        dataQueryTime,
      ),
    };
  } else {
    metrics.optimizations = {
      ...optimizations,
      recommendations: getPerformanceRecommendations(
        totalExecutionTime,
        0,
        countQueryTime,
        idsQueryTime,
        dataQueryTime,
      ),
    };
  }

  // Add custom metrics if provided
  if (customMetrics) {
    metrics.customMetrics = customMetrics;
  }

  return metrics;
}

/**
 * Logs performance metrics using the provided logger
 */
export function logPerformanceMetrics(logger: Logger, serviceName: string, metrics: PerformanceMetrics): void {
  logger.log(`${serviceName}.${metrics.function} - Performance Metrics: ${JSON.stringify(metrics, null, 2)}`);
}

/**
 * Creates a performance timer that returns start and end functions
 */
export function createPerformanceTimer() {
  const startTime = performance.now();

  return {
    startTime,
    getElapsed: () => performance.now() - startTime,
    getCurrent: () => performance.now(),
  };
}

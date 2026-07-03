/**
 * DeploymentInfrastructureDiagram — Architecture diagram for deployment infrastructure.
 *
 * Depicts CI/CD pipeline, container registry, Kubernetes cluster, monitoring,
 * and multi-environment deployment in a token-driven SVG skeleton.
 *
 * @module components/diagrams/composed/DeploymentInfrastructureDiagram
 * Validates: Requirements 10.6
 */

import React from 'react';
import {
  DiagramCanvas,
  DiagramNode,
  DiagramEdge,
  DiagramCluster,
  DiagramLegend,
} from '../primitives';

export const DeploymentInfrastructureDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="Deployment Infrastructure Architecture"
      description="Architecture diagram showing CI/CD pipeline with GitHub Actions, container registry, Kubernetes cluster with staging and production environments, and observability stack."
      viewBox="0 0 860 520"
      aspectRatio={860 / 520}
    >
      {/* Source control */}
      <DiagramNode
        variant="external"
        label="GitHub"
        sublabel="Source control"
        x={30}
        y={100}
        width={130}
        height={50}
      />

      {/* CI/CD cluster */}
      <DiagramCluster
        label="CI / CD Pipeline"
        bounds={{ x: 200, y: 30, width: 220, height: 240 }}
        tone="primary"
      >
        <DiagramNode
          variant="service"
          label="GitHub Actions"
          sublabel="Build trigger"
          x={225}
          y={70}
          width={160}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Test Runner"
          sublabel="Unit + integration"
          x={225}
          y={135}
          width={160}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Docker Build"
          sublabel="Multi-stage build"
          x={225}
          y={200}
          width={160}
          height={45}
        />
      </DiagramCluster>

      {/* Container registry */}
      <DiagramNode
        variant="datastore"
        label="Container Registry"
        sublabel="ECR / GHCR"
        x={470}
        y={80}
        width={160}
        height={50}
      />

      {/* Staging cluster */}
      <DiagramCluster
        label="Staging Environment"
        bounds={{ x: 470, y: 160, width: 200, height: 140 }}
        tone="warning"
      >
        <DiagramNode
          variant="service"
          label="K8s Namespace"
          sublabel="staging"
          x={495}
          y={195}
          width={150}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Service Mesh"
          sublabel="Istio / Linkerd"
          x={495}
          y={260}
          width={150}
          height={45}
        />
      </DiagramCluster>

      {/* Production cluster */}
      <DiagramCluster
        label="Production Environment"
        bounds={{ x: 470, y: 330, width: 200, height: 140 }}
        tone="success"
      >
        <DiagramNode
          variant="service"
          label="K8s Namespace"
          sublabel="production"
          x={495}
          y={365}
          width={150}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="HPA / Scaling"
          sublabel="Auto-scale pods"
          x={495}
          y={430}
          width={150}
          height={45}
        />
      </DiagramCluster>

      {/* Observability */}
      <DiagramCluster
        label="Observability"
        bounds={{ x: 700, y: 160, width: 140, height: 200 }}
        tone="neutral"
      >
        <DiagramNode
          variant="service"
          label="Prometheus"
          sublabel="Metrics"
          x={715}
          y={195}
          width={110}
          height={40}
        />
        <DiagramNode
          variant="service"
          label="Grafana"
          sublabel="Dashboards"
          x={715}
          y={255}
          width={110}
          height={40}
        />
        <DiagramNode
          variant="service"
          label="Loki"
          sublabel="Log aggregation"
          x={715}
          y={315}
          width={110}
          height={40}
        />
      </DiagramCluster>

      {/* CDN */}
      <DiagramNode
        variant="external"
        label="CDN / Load Balancer"
        sublabel="Cloudflare / ALB"
        x={30}
        y={370}
        width={150}
        height={50}
      />

      {/* Edges: GitHub → CI */}
      <DiagramEdge
        from={{ x: 160, y: 125 }}
        to={{ x: 225, y: 92 }}
        arrowhead="end"
        label="push / PR"
        animated
      />

      {/* Edges within CI */}
      <DiagramEdge
        from={{ x: 305, y: 115 }}
        to={{ x: 305, y: 135 }}
        arrowhead="end"
      />
      <DiagramEdge
        from={{ x: 305, y: 180 }}
        to={{ x: 305, y: 200 }}
        arrowhead="end"
      />

      {/* Edges: CI → Registry */}
      <DiagramEdge
        from={{ x: 420, y: 105 }}
        to={{ x: 470, y: 105 }}
        arrowhead="end"
        label="push image"
      />

      {/* Edges: Registry → Staging */}
      <DiagramEdge
        from={{ x: 550, y: 130 }}
        to={{ x: 550, y: 160 }}
        arrowhead="end"
        label="deploy"
        style="dashed"
      />

      {/* Edges: Staging → Production */}
      <DiagramEdge
        from={{ x: 550, y: 300 }}
        to={{ x: 550, y: 330 }}
        arrowhead="end"
        label="promote"
      />

      {/* Edges: K8s → Observability */}
      <DiagramEdge
        from={{ x: 670, y: 220 }}
        to={{ x: 715, y: 215 }}
        arrowhead="end"
        style="dashed"
        label="metrics"
      />
      <DiagramEdge
        from={{ x: 670, y: 390 }}
        to={{ x: 715, y: 335 }}
        arrowhead="end"
        style="dashed"
        label="logs"
      />

      {/* Edges: CDN → Production */}
      <DiagramEdge
        from={{ x: 180, y: 395 }}
        to={{ x: 470, y: 390 }}
        arrowhead="end"
        label="traffic"
        animated
      />

      {/* Legend */}
      <g transform="translate(20, 440)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-success)', label: 'Datastore', shape: 'square' },
            { color: 'var(--color-warning)', label: 'Staging', shape: 'diamond' },
            { color: 'var(--color-text-muted)', label: 'External', shape: 'line' },
          ]}
          position="bottom-left"
        />
      </g>
    </DiagramCanvas>
  );
};

export default DeploymentInfrastructureDiagram;

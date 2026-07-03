/**
 * MultiTenantSaaSDiagram — Architecture diagram for multi-tenant SaaS systems.
 *
 * Depicts tenant isolation, shared services, billing, and RBAC layers
 * in a token-driven SVG skeleton.
 *
 * @module components/diagrams/composed/MultiTenantSaaSDiagram
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

export const MultiTenantSaaSDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="Multi-Tenant SaaS Architecture"
      description="Architecture diagram showing tenant isolation boundaries, shared platform services, RBAC authorization, and billing infrastructure for a multi-tenant SaaS system."
      viewBox="0 0 820 540"
      aspectRatio={820 / 540}
    >
      {/* Tenant layer */}
      <DiagramCluster
        label="Tenant Boundary"
        bounds={{ x: 20, y: 30, width: 250, height: 220 }}
        tone="primary"
      >
        <DiagramNode
          variant="user"
          label="Tenant A"
          sublabel="Isolated context"
          x={50}
          y={70}
          width={130}
          height={50}
        />
        <DiagramNode
          variant="user"
          label="Tenant B"
          sublabel="Isolated context"
          x={50}
          y={150}
          width={130}
          height={50}
        />
      </DiagramCluster>

      {/* Auth & RBAC */}
      <DiagramCluster
        label="Auth & RBAC"
        bounds={{ x: 310, y: 30, width: 200, height: 150 }}
        tone="warning"
      >
        <DiagramNode
          variant="service"
          label="Auth Service"
          sublabel="JWT / OAuth2"
          x={335}
          y={65}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="RBAC Engine"
          sublabel="Permission resolver"
          x={335}
          y={125}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Shared services */}
      <DiagramCluster
        label="Shared Platform Services"
        bounds={{ x: 310, y: 210, width: 200, height: 220 }}
        tone="success"
      >
        <DiagramNode
          variant="service"
          label="API Gateway"
          sublabel="Tenant-aware routing"
          x={335}
          y={245}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Notification Svc"
          sublabel="Email / push"
          x={335}
          y={310}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="queue"
          label="Job Scheduler"
          sublabel="Tenant-scoped jobs"
          x={335}
          y={375}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Data layer */}
      <DiagramCluster
        label="Data Layer"
        bounds={{ x: 560, y: 30, width: 230, height: 220 }}
        tone="neutral"
      >
        <DiagramNode
          variant="datastore"
          label="Tenant DB"
          sublabel="Schema-per-tenant"
          x={590}
          y={70}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="datastore"
          label="Shared DB"
          sublabel="Platform metadata"
          x={590}
          y={145}
          width={140}
          height={50}
        />
      </DiagramCluster>

      {/* Billing */}
      <DiagramNode
        variant="external"
        label="Billing Service"
        sublabel="Stripe / usage metering"
        x={590}
        y={290}
        width={160}
        height={50}
      />

      {/* Audit */}
      <DiagramNode
        variant="datastore"
        label="Audit Log"
        sublabel="Immutable events"
        x={590}
        y={380}
        width={160}
        height={50}
      />

      {/* Edges: Tenants → Auth */}
      <DiagramEdge
        from={{ x: 180, y: 95 }}
        to={{ x: 335, y: 87 }}
        arrowhead="end"
        label="authenticate"
      />
      <DiagramEdge
        from={{ x: 180, y: 175 }}
        to={{ x: 335, y: 147 }}
        arrowhead="end"
      />

      {/* Edges: Auth → API Gateway */}
      <DiagramEdge
        from={{ x: 405, y: 180 }}
        to={{ x: 405, y: 245 }}
        arrowhead="end"
        label="authorized"
      />

      {/* Edges: API Gateway → Data */}
      <DiagramEdge
        from={{ x: 475, y: 267 }}
        to={{ x: 590, y: 95 }}
        arrowhead="end"
        label="query"
      />
      <DiagramEdge
        from={{ x: 475, y: 267 }}
        to={{ x: 590, y: 170 }}
        arrowhead="end"
        style="dashed"
      />

      {/* Edges: Shared services → Billing */}
      <DiagramEdge
        from={{ x: 475, y: 332 }}
        to={{ x: 590, y: 315 }}
        arrowhead="end"
        label="usage"
      />

      {/* Edges: API Gateway → Audit */}
      <DiagramEdge
        from={{ x: 475, y: 397 }}
        to={{ x: 590, y: 405 }}
        arrowhead="end"
        style="dashed"
        label="log"
      />

      {/* Legend */}
      <g transform="translate(20, 460)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-accent-secondary)', label: 'User / Tenant', shape: 'circle' },
            { color: 'var(--color-success)', label: 'Datastore', shape: 'square' },
            { color: 'var(--color-warning)', label: 'Queue', shape: 'diamond' },
            { color: 'var(--color-text-muted)', label: 'External', shape: 'line' },
          ]}
          position="bottom-left"
        />
      </g>
    </DiagramCanvas>
  );
};

export default MultiTenantSaaSDiagram;

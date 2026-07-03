/**
 * WhatsAppInfrastructureDiagram — Architecture diagram for WhatsApp infrastructure.
 *
 * Depicts webhook ingestion, message processing, delivery pipelines,
 * and Cloud API integration in a token-driven SVG skeleton.
 *
 * @module components/diagrams/composed/WhatsAppInfrastructureDiagram
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

export const WhatsAppInfrastructureDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="WhatsApp Infrastructure Architecture"
      description="Architecture diagram showing webhook ingestion from WhatsApp Cloud API, message processing pipeline, delivery tracking, and media handling infrastructure."
      viewBox="0 0 840 500"
      aspectRatio={840 / 500}
    >
      {/* External: WhatsApp Cloud API */}
      <DiagramNode
        variant="external"
        label="WhatsApp Cloud API"
        sublabel="Meta platform"
        x={30}
        y={180}
        width={150}
        height={55}
      />

      {/* Ingestion layer */}
      <DiagramCluster
        label="Ingestion Layer"
        bounds={{ x: 220, y: 30, width: 200, height: 200 }}
        tone="primary"
      >
        <DiagramNode
          variant="service"
          label="Webhook Receiver"
          sublabel="Signature verify"
          x={245}
          y={65}
          width={150}
          height={50}
        />
        <DiagramNode
          variant="queue"
          label="Inbound Queue"
          sublabel="Rate-limited buffer"
          x={245}
          y={145}
          width={150}
          height={50}
        />
      </DiagramCluster>

      {/* Processing layer */}
      <DiagramCluster
        label="Processing"
        bounds={{ x: 460, y: 30, width: 180, height: 270 }}
        tone="success"
      >
        <DiagramNode
          variant="service"
          label="Message Router"
          sublabel="Type dispatch"
          x={480}
          y={65}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Text Handler"
          sublabel="NLP / templates"
          x={480}
          y={130}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Media Handler"
          sublabel="Download / resize"
          x={480}
          y={195}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="lambda"
          label="Bot Engine"
          sublabel="Auto-reply logic"
          x={480}
          y={255}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Delivery layer */}
      <DiagramCluster
        label="Delivery"
        bounds={{ x: 460, y: 330, width: 180, height: 140 }}
        tone="warning"
      >
        <DiagramNode
          variant="queue"
          label="Outbound Queue"
          sublabel="Throttled dispatch"
          x={480}
          y={360}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Delivery Tracker"
          sublabel="Read receipts"
          x={480}
          y={420}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Data stores */}
      <DiagramCluster
        label="Storage"
        bounds={{ x: 680, y: 100, width: 140, height: 200 }}
        tone="neutral"
      >
        <DiagramNode
          variant="datastore"
          label="Message DB"
          sublabel="Conversations"
          x={695}
          y={135}
          width={110}
          height={45}
        />
        <DiagramNode
          variant="datastore"
          label="Media Store"
          sublabel="S3 / CDN"
          x={695}
          y={205}
          width={110}
          height={45}
        />
        <DiagramNode
          variant="datastore"
          label="Analytics"
          sublabel="Metrics / logs"
          x={695}
          y={270}
          width={110}
          height={45}
        />
      </DiagramCluster>

      {/* Edges: WhatsApp → Ingestion */}
      <DiagramEdge
        from={{ x: 180, y: 207 }}
        to={{ x: 245, y: 90 }}
        arrowhead="end"
        label="webhook"
        animated
      />

      {/* Edges: Webhook → Queue */}
      <DiagramEdge
        from={{ x: 320, y: 115 }}
        to={{ x: 320, y: 145 }}
        arrowhead="end"
      />

      {/* Edges: Queue → Router */}
      <DiagramEdge
        from={{ x: 395, y: 170 }}
        to={{ x: 480, y: 87 }}
        arrowhead="end"
        label="dispatch"
      />

      {/* Edges: Router → Handlers */}
      <DiagramEdge
        from={{ x: 550, y: 110 }}
        to={{ x: 550, y: 130 }}
        arrowhead="end"
      />
      <DiagramEdge
        from={{ x: 550, y: 175 }}
        to={{ x: 550, y: 195 }}
        arrowhead="end"
      />
      <DiagramEdge
        from={{ x: 550, y: 240 }}
        to={{ x: 550, y: 255 }}
        arrowhead="end"
      />

      {/* Edges: Handlers → Storage */}
      <DiagramEdge
        from={{ x: 620, y: 152 }}
        to={{ x: 695, y: 157 }}
        arrowhead="end"
        style="dashed"
        label="persist"
      />
      <DiagramEdge
        from={{ x: 620, y: 217 }}
        to={{ x: 695, y: 227 }}
        arrowhead="end"
        style="dashed"
      />

      {/* Edges: Bot → Outbound */}
      <DiagramEdge
        from={{ x: 550, y: 300 }}
        to={{ x: 550, y: 360 }}
        arrowhead="end"
        label="reply"
      />

      {/* Edges: Outbound → WhatsApp (return path) */}
      <DiagramEdge
        from={{ x: 480, y: 382 }}
        to={{ x: 105, y: 235 }}
        arrowhead="end"
        animated
        label="send"
      />

      {/* Legend */}
      <g transform="translate(20, 400)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-success)', label: 'Datastore', shape: 'circle' },
            { color: 'var(--color-warning)', label: 'Queue', shape: 'diamond' },
            { color: 'var(--color-text-muted)', label: 'External API', shape: 'line' },
            { color: 'var(--color-accent-primary)', label: 'Lambda', shape: 'square' },
          ]}
          position="bottom-left"
        />
      </g>
    </DiagramCanvas>
  );
};

export default WhatsAppInfrastructureDiagram;

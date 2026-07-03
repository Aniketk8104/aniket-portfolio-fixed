/**
 * DistributedMessagingDiagram — Architecture diagram for distributed messaging systems.
 *
 * Depicts BullMQ workers, Redis, message queues, and consumers in a
 * token-driven SVG skeleton. Users can refine node positions and labels.
 *
 * @module components/diagrams/composed/DistributedMessagingDiagram
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

export const DistributedMessagingDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="Distributed Messaging Architecture"
      description="Architecture diagram showing BullMQ workers, Redis message broker, queues, and consumer services processing messages at scale."
      viewBox="0 0 800 500"
      aspectRatio={800 / 500}
    >
      {/* Producer cluster */}
      <DiagramCluster
        label="Producers"
        bounds={{ x: 20, y: 40, width: 200, height: 180 }}
        tone="primary"
      >
        <DiagramNode
          variant="service"
          label="API Gateway"
          sublabel="HTTP ingestion"
          x={50}
          y={80}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="service"
          label="Webhook Handler"
          sublabel="Event source"
          x={50}
          y={150}
          width={140}
          height={50}
        />
      </DiagramCluster>

      {/* Message broker */}
      <DiagramCluster
        label="Message Broker"
        bounds={{ x: 280, y: 60, width: 220, height: 160 }}
        tone="warning"
      >
        <DiagramNode
          variant="datastore"
          label="Redis"
          sublabel="BullMQ backend"
          x={310}
          y={100}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="queue"
          label="Job Queue"
          sublabel="Priority queues"
          x={310}
          y={170}
          width={140}
          height={50}
        />
      </DiagramCluster>

      {/* Consumer cluster */}
      <DiagramCluster
        label="Consumers"
        bounds={{ x: 560, y: 40, width: 220, height: 250 }}
        tone="success"
      >
        <DiagramNode
          variant="service"
          label="Worker A"
          sublabel="Email notifications"
          x={590}
          y={80}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="service"
          label="Worker B"
          sublabel="Data processing"
          x={590}
          y={150}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="lambda"
          label="Worker C"
          sublabel="Analytics pipeline"
          x={590}
          y={220}
          width={140}
          height={50}
        />
      </DiagramCluster>

      {/* Dead letter queue */}
      <DiagramNode
        variant="queue"
        label="Dead Letter Queue"
        sublabel="Failed jobs"
        x={320}
        y={300}
        width={150}
        height={50}
      />

      {/* Monitoring */}
      <DiagramNode
        variant="external"
        label="Monitoring"
        sublabel="Bull Board / Grafana"
        x={320}
        y={400}
        width={150}
        height={50}
      />

      {/* Edges: Producers → Broker */}
      <DiagramEdge
        from={{ x: 190, y: 105 }}
        to={{ x: 310, y: 125 }}
        arrowhead="end"
        label="enqueue"
      />
      <DiagramEdge
        from={{ x: 190, y: 175 }}
        to={{ x: 310, y: 195 }}
        arrowhead="end"
        label="publish"
      />

      {/* Edges: Broker → Consumers */}
      <DiagramEdge
        from={{ x: 450, y: 125 }}
        to={{ x: 590, y: 105 }}
        arrowhead="end"
        label="dequeue"
        animated
      />
      <DiagramEdge
        from={{ x: 450, y: 155 }}
        to={{ x: 590, y: 175 }}
        arrowhead="end"
        animated
      />
      <DiagramEdge
        from={{ x: 450, y: 195 }}
        to={{ x: 590, y: 245 }}
        arrowhead="end"
        animated
      />

      {/* Edges: Failed → DLQ */}
      <DiagramEdge
        from={{ x: 395, y: 220 }}
        to={{ x: 395, y: 300 }}
        arrowhead="end"
        style="dashed"
        label="retry failed"
      />

      {/* Edges: DLQ → Monitoring */}
      <DiagramEdge
        from={{ x: 395, y: 350 }}
        to={{ x: 395, y: 400 }}
        arrowhead="end"
        style="dashed"
        label="alert"
      />

      {/* Legend */}
      <g transform="translate(640, 360)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-success)', label: 'Datastore', shape: 'circle' },
            { color: 'var(--color-warning)', label: 'Queue', shape: 'diamond' },
            { color: 'var(--color-text-muted)', label: 'External', shape: 'line' },
          ]}
          position="bottom-right"
        />
      </g>
    </DiagramCanvas>
  );
};

export default DistributedMessagingDiagram;

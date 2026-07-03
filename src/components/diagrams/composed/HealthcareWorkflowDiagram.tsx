/**
 * HealthcareWorkflowDiagram — Architecture diagram for healthcare workflow systems.
 *
 * Depicts DICOM ingestion, case routing, radiologist assignment,
 * and audit trail in a token-driven SVG skeleton.
 *
 * @module components/diagrams/composed/HealthcareWorkflowDiagram
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

export const HealthcareWorkflowDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="Healthcare Workflow Architecture"
      description="Architecture diagram showing DICOM image ingestion, intelligent case routing, radiologist assignment workflow, reporting pipeline, and compliance audit trail."
      viewBox="0 0 840 520"
      aspectRatio={840 / 520}
    >
      {/* DICOM source */}
      <DiagramNode
        variant="external"
        label="PACS / Modality"
        sublabel="DICOM source"
        x={30}
        y={120}
        width={140}
        height={55}
      />

      {/* Ingestion cluster */}
      <DiagramCluster
        label="Ingestion Pipeline"
        bounds={{ x: 210, y: 30, width: 200, height: 200 }}
        tone="primary"
      >
        <DiagramNode
          variant="service"
          label="DICOM Receiver"
          sublabel="C-STORE SCP"
          x={235}
          y={65}
          width={150}
          height={45}
        />
        <DiagramNode
          variant="service"
          label="Image Processor"
          sublabel="Normalize / anonymize"
          x={235}
          y={130}
          width={150}
          height={45}
        />
        <DiagramNode
          variant="datastore"
          label="Image Store"
          sublabel="Object storage"
          x={235}
          y={195}
          width={150}
          height={45}
        />
      </DiagramCluster>

      {/* Routing cluster */}
      <DiagramCluster
        label="Case Routing"
        bounds={{ x: 450, y: 30, width: 180, height: 150 }}
        tone="warning"
      >
        <DiagramNode
          variant="service"
          label="Triage Engine"
          sublabel="Priority scoring"
          x={470}
          y={65}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="lambda"
          label="AI Pre-read"
          sublabel="Anomaly detection"
          x={470}
          y={130}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Assignment cluster */}
      <DiagramCluster
        label="Assignment"
        bounds={{ x: 450, y: 210, width: 180, height: 150 }}
        tone="success"
      >
        <DiagramNode
          variant="service"
          label="Worklist Manager"
          sublabel="Load balancing"
          x={470}
          y={245}
          width={140}
          height={45}
        />
        <DiagramNode
          variant="queue"
          label="Assignment Queue"
          sublabel="FIFO + priority"
          x={470}
          y={310}
          width={140}
          height={45}
        />
      </DiagramCluster>

      {/* Radiologist */}
      <DiagramNode
        variant="user"
        label="Radiologist"
        sublabel="Reporting viewer"
        x={670}
        y={245}
        width={140}
        height={55}
      />

      {/* Reporting */}
      <DiagramNode
        variant="service"
        label="Report Generator"
        sublabel="Structured reports"
        x={670}
        y={330}
        width={140}
        height={50}
      />

      {/* Audit & compliance */}
      <DiagramCluster
        label="Compliance"
        bounds={{ x: 450, y: 390, width: 360, height: 100 }}
        tone="neutral"
      >
        <DiagramNode
          variant="datastore"
          label="Audit Trail"
          sublabel="Immutable log"
          x={470}
          y={420}
          width={130}
          height={45}
        />
        <DiagramNode
          variant="datastore"
          label="HIPAA Vault"
          sublabel="Encrypted PHI"
          x={630}
          y={420}
          width={130}
          height={45}
        />
      </DiagramCluster>

      {/* Edges: PACS → Ingestion */}
      <DiagramEdge
        from={{ x: 170, y: 147 }}
        to={{ x: 235, y: 87 }}
        arrowhead="end"
        label="DICOM push"
        animated
      />

      {/* Edges: Receiver → Processor */}
      <DiagramEdge
        from={{ x: 310, y: 110 }}
        to={{ x: 310, y: 130 }}
        arrowhead="end"
      />

      {/* Edges: Processor → Store */}
      <DiagramEdge
        from={{ x: 310, y: 175 }}
        to={{ x: 310, y: 195 }}
        arrowhead="end"
      />

      {/* Edges: Ingestion → Routing */}
      <DiagramEdge
        from={{ x: 385, y: 87 }}
        to={{ x: 470, y: 87 }}
        arrowhead="end"
        label="new case"
      />

      {/* Edges: Triage → AI Pre-read */}
      <DiagramEdge
        from={{ x: 540, y: 110 }}
        to={{ x: 540, y: 130 }}
        arrowhead="end"
      />

      {/* Edges: Routing → Assignment */}
      <DiagramEdge
        from={{ x: 540, y: 175 }}
        to={{ x: 540, y: 245 }}
        arrowhead="end"
        label="assign"
      />

      {/* Edges: Worklist → Queue */}
      <DiagramEdge
        from={{ x: 540, y: 290 }}
        to={{ x: 540, y: 310 }}
        arrowhead="end"
      />

      {/* Edges: Queue → Radiologist */}
      <DiagramEdge
        from={{ x: 610, y: 332 }}
        to={{ x: 670, y: 272 }}
        arrowhead="end"
        label="pick up"
      />

      {/* Edges: Radiologist → Report */}
      <DiagramEdge
        from={{ x: 740, y: 300 }}
        to={{ x: 740, y: 330 }}
        arrowhead="end"
        label="dictate"
      />

      {/* Edges: Report → Audit */}
      <DiagramEdge
        from={{ x: 740, y: 380 }}
        to={{ x: 695, y: 420 }}
        arrowhead="end"
        style="dashed"
        label="log"
      />

      {/* Edges: Assignment → Audit */}
      <DiagramEdge
        from={{ x: 540, y: 355 }}
        to={{ x: 535, y: 420 }}
        arrowhead="end"
        style="dashed"
        label="audit"
      />

      {/* Legend */}
      <g transform="translate(20, 420)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-accent-secondary)', label: 'User', shape: 'circle' },
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

export default HealthcareWorkflowDiagram;

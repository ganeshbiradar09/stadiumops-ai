import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecommendationPanel } from './RecommendationPanel';
import { RecommendationCard } from './RecommendationCard';

const mockRecommendation = {
  id: 'rec-1',
  title: 'Test Recommendation',
  description: 'Test description',
  priority: 'Critical',
  status: 'Pending',
  confidence: 95,
  recommended_action: 'Test action',
  estimated_queue_reduction: '10%',
  estimated_resolution_time: '5 mins',
  staff_required: '2',
  expected_operational_impact: 'Major'
};

describe('RecommendationPanel Components', () => {
  it('renders loading states correctly for all stages', () => {
    const { rerender } = render(<RecommendationPanel isAiProcessing={true} loadingStage={0} recommendations={[]} />);
    expect(screen.getByText('Connecting telemetry…')).toBeInTheDocument();

    rerender(<RecommendationPanel isAiProcessing={true} loadingStage={1} recommendations={[]} />);
    expect(screen.getByText('Analyzing operational data…')).toBeInTheDocument();

    rerender(<RecommendationPanel isAiProcessing={true} loadingStage={2} recommendations={[]} />);
    expect(screen.getByText('Generating AI recommendations…')).toBeInTheDocument();
  });

  it('renders empty state when no recommendations exist', () => {
    render(<RecommendationPanel isAiProcessing={false} recommendations={[]} />);
    expect(screen.getByText('No recommendations computed.')).toBeInTheDocument();
  });

  it('renders recommendations list', () => {
    render(<RecommendationPanel isAiProcessing={false} recommendations={[mockRecommendation]} />);
    expect(screen.getByText('Test Recommendation')).toBeInTheDocument();
  });
});

describe('RecommendationCard Component', () => {
  it('renders Critical/Pending recommendation and triggers actions', () => {
    const onExplain = vi.fn();
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <RecommendationCard 
        rec={mockRecommendation} 
        index={0} 
        onExplain={onExplain}
        onApprove={onApprove}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Explain Decision'));
    expect(onExplain).toHaveBeenCalledWith(mockRecommendation);

    fireEvent.click(screen.getByText('Approve'));
    expect(onApprove).toHaveBeenCalledWith('rec-1');
    
    // The reject button is the X icon, which has aria-label="Reject recommendation: Test Recommendation"
    fireEvent.click(screen.getByLabelText('Reject recommendation: Test Recommendation'));
    expect(onReject).toHaveBeenCalledWith('rec-1');
  });

  it('renders High/Approved recommendation', () => {
    const rec = { ...mockRecommendation, priority: 'High', status: 'Approved' };
    render(<RecommendationCard rec={rec} index={0} />);
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders Normal/Rejected recommendation', () => {
    const rec = { ...mockRecommendation, priority: 'Normal', status: 'Rejected' };
    render(<RecommendationCard rec={rec} index={0} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});

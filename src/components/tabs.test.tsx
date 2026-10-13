import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Tab, Tabs, TabsContent, TabsList } from './tabs';

function SyncedTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      {[1, 2].map((group) => (
        <Tabs
          key={group}
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <Tab value="overview">Overview {group}</Tab>
            <Tab value="activity">Activity {group}</Tab>
          </TabsList>
          <TabsContent value="overview">Overview content {group}</TabsContent>
          <TabsContent value="activity">Activity content {group}</TabsContent>
        </Tabs>
      ))}
    </>
  );
}

describe('Tabs', () => {
  it('synchronizes controlled tab groups through their shared value', () => {
    render(<SyncedTabs />);

    fireEvent.click(screen.getByRole('button', { name: 'Activity 1' }));

    expect(screen.getByText('Activity content 1')).toBeTruthy();
    expect(screen.getByText('Activity content 2')).toBeTruthy();
    expect(screen.queryByText('Overview content 1')).toBeNull();
    expect(screen.queryByText('Overview content 2')).toBeNull();
  });

  it('updates itself and calls click handlers when uncontrolled', () => {
    const handleValueChange = vi.fn();
    const handleTabClick = vi.fn();

    render(
      <Tabs
        defaultValue="overview"
        onValueChange={handleValueChange}
        onTabClick={handleTabClick}
      >
        <TabsList>
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="activity">Activity content</TabsContent>
      </Tabs>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Activity' }));

    expect(screen.getByText('Activity content')).toBeTruthy();
    expect(handleValueChange).toHaveBeenCalledWith('activity');
    expect(handleTabClick).toHaveBeenCalledWith('activity');
  });
});

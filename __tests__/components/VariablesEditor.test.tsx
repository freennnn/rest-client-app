import React from 'react';

import VariablesEditor from '@/components/VariablesEditor';
import { loadVariables, saveVariables } from '@/utils/variables/variableStorage';
import { Variable } from '@/utils/variables/variableSubstitution';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('@/utils/variables/variableStorage', () => ({
  loadVariables: jest.fn(),
  saveVariables: jest.fn(),
}));

describe('VariablesEditor Component', () => {
  const mockVariables: Variable[] = [
    { id: 'var-1', name: 'API_KEY', value: 'abc123' },
    { id: 'var-2', name: 'BASE_URL', value: 'https://api.example.com' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (loadVariables as jest.Mock).mockReturnValue(mockVariables);

    (saveVariables as jest.Mock).mockReturnValue(true);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders the component with loaded variables', async () => {
    render(<VariablesEditor />);

    expect(loadVariables).toHaveBeenCalledTimes(1);

    expect(screen.getByText('{{API_KEY}}')).toBeInTheDocument();
    expect(screen.getByText('{{BASE_URL}}')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    const variableValueInputs = inputs.filter(
      (input) =>
        input.getAttribute('value') === 'abc123' ||
        input.getAttribute('value') === 'https://api.example.com'
    );
    expect(variableValueInputs).toHaveLength(2);
  });

  test('renders empty state when no variables exist', () => {
    (loadVariables as jest.Mock).mockReturnValue([]);

    render(<VariablesEditor />);

    expect(screen.getByText('No variables defined yet. Create one below.')).toBeInTheDocument();
  });

  test('adds a new variable', async () => {
    render(<VariablesEditor />);

    const nameInput = screen.getByLabelText('Variable Name');
    const valueInput = screen.getByLabelText('Value');
    const addButton = screen.getByRole('button', { name: 'Add Variable' });

    fireEvent.change(nameInput, { target: { value: 'NEW_VAR' } });
    fireEvent.change(valueInput, { target: { value: 'new-value' } });
    fireEvent.click(addButton);

    expect(screen.getByText('{{NEW_VAR}}')).toBeInTheDocument();

    expect(nameInput).toHaveValue('');
    expect(valueInput).toHaveValue('');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(saveVariables).toHaveBeenCalled();
    const savedVariables = (saveVariables as jest.Mock).mock.calls[0][0];
    expect(savedVariables).toHaveLength(3); // 2 original + 1 new
    expect(savedVariables[2].name).toBe('NEW_VAR');
    expect(savedVariables[2].value).toBe('new-value');
  });

  test('deletes an existing variable', async () => {
    render(<VariablesEditor />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    expect(screen.queryByText('{{API_KEY}}')).not.toBeInTheDocument();
    expect(screen.getByText('{{BASE_URL}}')).toBeInTheDocument(); // Second variable should still exist

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(saveVariables).toHaveBeenCalled();
    const savedVariables = (saveVariables as jest.Mock).mock.calls[0][0];
    expect(savedVariables).toHaveLength(1); // Only the remaining variable
    expect(savedVariables[0].name).toBe('BASE_URL');
  });

  test('updates an existing variable value', async () => {
    render(<VariablesEditor />);

    const inputs = screen.getAllByRole('textbox');
    const apiKeyInput = inputs.find((input) => input.getAttribute('value') === 'abc123');
    expect(apiKeyInput).toBeDefined();

    fireEvent.change(apiKeyInput!, { target: { value: 'updated-key' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(saveVariables).toHaveBeenCalled();
    const savedVariables = (saveVariables as jest.Mock).mock.calls[0][0];
    expect(savedVariables).toHaveLength(2);
    expect(savedVariables[0].value).toBe('updated-key');
  });

  test('displays saving status and then saved status', async () => {
    render(<VariablesEditor />);

    const inputs = screen.getAllByRole('textbox');
    const apiKeyInput = inputs.find((input) => input.getAttribute('value') === 'abc123');
    fireEvent.change(apiKeyInput!, { target: { value: 'new-value' } });

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText('Changes saved successfully')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(screen.queryByText('Changes saved successfully')).not.toBeInTheDocument();
  });

  test('displays error status when save fails', async () => {
    (saveVariables as jest.Mock).mockReturnValue(false);

    render(<VariablesEditor />);

    const inputs = screen.getAllByRole('textbox');
    const apiKeyInput = inputs.find((input) => input.getAttribute('value') === 'abc123');
    fireEvent.change(apiKeyInput!, { target: { value: 'new-value' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
  });

  test('disables add button when variable name is empty', () => {
    render(<VariablesEditor />);

    const variableContainers = screen
      .getAllByText(/\{\{.*\}\}/)
      .filter((el) => el.className.includes('font-mono'));
    const initialCount = variableContainers.length;

    const addButton = screen.getByRole('button', { name: 'Add Variable' });
    expect(addButton).toBeDisabled();

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: 'some-value' } });

    expect(addButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Variable Name');
    fireEvent.change(nameInput, { target: { value: 'VALID_NAME' } });

    expect(addButton).not.toBeDisabled();

    fireEvent.change(nameInput, { target: { value: '' } });

    expect(addButton).toBeDisabled();

    const updatedVariableContainers = screen
      .getAllByText(/\{\{.*\}\}/)
      .filter((el) => el.className.includes('font-mono'));
    expect(updatedVariableContainers).toHaveLength(initialCount);
  });

  test('renders usage instructions', () => {
    render(<VariablesEditor />);

    expect(screen.getByText('How to Use Variables')).toBeInTheDocument();
    expect(screen.getByText('Variables can be used in:')).toBeInTheDocument();
    expect(screen.getByText('URLs:')).toBeInTheDocument();
    expect(screen.getByText('Headers:')).toBeInTheDocument();
    expect(screen.getByText('Request Body:')).toBeInTheDocument();
  });

  test('cleans up timeout on unmount', () => {
    const { unmount } = render(<VariablesEditor />);

    const inputs = screen.getAllByRole('textbox');
    const apiKeyInput = inputs.find((input) => input.getAttribute('value') === 'abc123');
    fireEvent.change(apiKeyInput!, { target: { value: 'new-value' } });

    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});

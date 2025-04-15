'use client';

import { useEffect, useState } from 'react';

interface Variable {
  id: string;
  name: string;
  value: string;
}

export default function VariablesEditor() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  useEffect(() => {
    try {
      const savedVariables = localStorage.getItem('restClientVariables');
      if (savedVariables) {
        setVariables(JSON.parse(savedVariables));
      }
    } catch (error) {
      console.error('Failed to parse variables from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('restClientVariables', JSON.stringify(variables));
    } catch (error) {
      console.error('Failed to save variables to localStorage:', error);
    }
  }, [variables]);

  const addVariable = () => {
    if (newVarName.trim() === '') return;

    const newVariable: Variable = {
      id: `var-${Date.now()}`,
      name: newVarName.trim(),
      value: newVarValue,
    };

    setVariables([...variables, newVariable]);
    setNewVarName('');
    setNewVarValue('');
  };

  const deleteVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const updateVariable = (id: string, value: string) => {
    setVariables(variables.map((v) => (v.id === id ? { ...v, value } : v)));
  };

  return (
    <div className='space-y-6'>
      {/* Variable list */}
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Your Variables</h2>

        {variables.length === 0 ? (
          <p className='text-gray-500 dark:text-gray-400'>
            No variables defined yet. Create one below.
          </p>
        ) : (
          <div className='space-y-2'>
            {variables.map((variable) => (
              <div
                key={variable.id}
                className='flex items-center space-x-2 p-2 border dark:border-gray-700 rounded'
              >
                <div className='font-mono'>
                  {'{{'}
                  {variable.name}
                  {'}}'}
                </div>
                <div className='flex-1'>
                  <input
                    type='text'
                    value={variable.value}
                    onChange={(e) => updateVariable(variable.id, e.target.value)}
                    className='w-full p-1 border dark:border-gray-700 dark:bg-gray-900 rounded'
                  />
                </div>
                <button
                  onClick={() => deleteVariable(variable.id)}
                  className='p-1 text-red-500 hover:text-red-700'
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Add New Variable</h2>
        <div className='space-y-3'>
          <div>
            <label htmlFor='varName' className='block mb-1'>
              Variable Name
            </label>
            <input
              id='varName'
              type='text'
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder='API_KEY'
              className='w-full p-2 border dark:border-gray-700 dark:bg-gray-900 rounded'
            />
          </div>
          <div>
            <label htmlFor='varValue' className='block mb-1'>
              Value
            </label>
            <input
              id='varValue'
              type='text'
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              placeholder='your-api-key-value'
              className='w-full p-2 border dark:border-gray-700 dark:bg-gray-900 rounded'
            />
          </div>
          <button
            onClick={addVariable}
            disabled={!newVarName.trim()}
            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50'
          >
            Add Variable
          </button>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-2'>How to Use Variables</h2>
        <div className='space-y-2 text-sm'>
          <p>Variables can be used in:</p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>
              URLs:{' '}
              <code className='bg-gray-100 dark:bg-gray-900 p-1 rounded'>
                https://api.example.com/{'{{'}
                <span>API_VERSION</span>
                {'}}'}/users
              </code>
            </li>
            <li>
              Headers:{' '}
              <code className='bg-gray-100 dark:bg-gray-900 p-1 rounded'>
                Authorization: Bearer {'{{'}
                <span>TOKEN</span>
                {'}}'}
              </code>
            </li>
            <li>
              Request Body:{' '}
              <code className='bg-gray-100 dark:bg-gray-900 p-1 rounded'>
                {'{ "apiKey": "'}
                {'{{'}
                <span>API_KEY</span>
                {'}}'}
                {'" }'}
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

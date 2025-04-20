'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadVariables, saveVariables } from '@/utils/variables/variableStorage';
import { Variable } from '@/utils/variables/variableSubstitution';
import { useTranslations } from 'next-intl';

export default function VariablesEditor() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const t = useTranslations('VariablesEditor');

  useEffect(() => {
    const storedVariables = loadVariables();
    setVariables(storedVariables);
  }, []);

  useEffect(() => {
    setSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      const success = saveVariables(variables);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } else {
        setSaveStatus('error');
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
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
    setSaveStatus('saving');
  };

  const deleteVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
    setSaveStatus('saving');
  };

  const updateVariable = (id: string, value: string) => {
    setVariables(variables.map((v) => (v.id === id ? { ...v, value } : v)));
    setSaveStatus('saving');
  };

  return (
    <div className='space-y-6'>
      {saveStatus !== 'idle' && (
        <div
          className={`p-2 rounded flex items-center text-sm ${
            saveStatus === 'saving'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              : saveStatus === 'saved'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {saveStatus === 'saving' && (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-yellow-600 dark:border-yellow-400 rounded-full border-t-transparent mr-2'></div>
              {t('statusSaving')}
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'
                ></path>
              </svg>
              {t('statusSaved')}
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              {t('statusError')}
            </>
          )}
        </div>
      )}

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>{t('yourVariablesTitle')}</h2>

        {variables.length === 0 ? (
          <p className='text-gray-500 dark:text-gray-400'>{t('noVariablesPlaceholder')}</p>
        ) : (
          <div className='space-y-2'>
            {variables.map((variable) => (
              <div
                key={variable.id}
                className='flex items-center space-x-2 p-2 border dark:border-gray-700 rounded'
              >
                <div className='font-mono text-sm w-1/3 overflow-hidden text-ellipsis whitespace-nowrap'>
                  {'{{'}
                  {variable.name}
                  {'}}'}
                </div>
                <div className='flex-1'>
                  <Input
                    type='text'
                    value={variable.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateVariable(variable.id, e.target.value)
                    }
                    className='w-full p-1 border dark:border-gray-700 dark:bg-gray-900 rounded'
                  />
                </div>
                <Button
                  onClick={() => deleteVariable(variable.id)}
                  variant='ghost'
                  size='sm'
                  className='text-red-500 hover:text-red-700'
                >
                  {t('deleteButton')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>{t('addNewTitle')}</h2>
        <div className='space-y-3'>
          <div>
            <Label htmlFor='varName' className='block mb-1'>
              {t('nameLabel')}
            </Label>
            <Input
              id='varName'
              type='text'
              value={newVarName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVarName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className='w-full p-2 border dark:border-gray-700 dark:bg-gray-900 rounded'
            />
          </div>
          <div>
            <Label htmlFor='varValue' className='block mb-1'>
              {t('valueLabel')}
            </Label>
            <Input
              id='varValue'
              type='text'
              value={newVarValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVarValue(e.target.value)}
              placeholder={t('valuePlaceholder')}
              className='w-full p-2 border dark:border-gray-700 dark:bg-gray-900 rounded'
            />
          </div>
          <Button
            onClick={addVariable}
            disabled={!newVarName.trim()}
            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50'
          >
            {t('addButton')}
          </Button>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-2'>{t('usageTitle')}</h2>
        <div className='space-y-2 text-sm'>
          <p>{t('usageIntro')}</p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>
              {t('usageUrl')}{' '}
              <code className='bg-gray-100 dark:bg-gray-900 p-1 rounded'>
                https://api.example.com/{'{{'}
                <span>API_VERSION</span>
                {'}}'}/users
              </code>
            </li>
            <li>
              {t('usageHeaders')}{' '}
              <code className='bg-gray-100 dark:bg-gray-900 p-1 rounded'>
                Authorization: Bearer {'{{'}
                <span>TOKEN</span>
                {'}}'}
              </code>
            </li>
            <li>
              {t('usageBody')}{' '}
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

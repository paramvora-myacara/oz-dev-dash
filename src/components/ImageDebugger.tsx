// src/components/ImageDebugger.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  validateSupabaseConfig, 
  testSupabaseConnection, 
  getAvailableImages, 
  getRandomImages,
  PROJECTS,
  IMAGE_CATEGORIES,
  type ProjectId,
  type ImageCategory
} from '../utils/supabaseImages';

export default function ImageDebugger() {
  const [configValidation, setConfigValidation] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectId>('edge-on-main-mesa-001');
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('general');

  useEffect(() => {
    // Run initial validation
    const validation = validateSupabaseConfig();
    setConfigValidation(validation);
  }, []);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testImageFetching = async () => {
    setLoading(true);
    try {
      const [availableImages, randomImages] = await Promise.all([
        getAvailableImages(selectedProject, selectedCategory),
        getRandomImages(selectedProject, selectedCategory, 3)
      ]);

      setTestResults({
        project: selectedProject,
        category: selectedCategory,
        availableImages: {
          count: availableImages.length,
          urls: availableImages.slice(0, 5) // Show first 5 URLs
        },
        randomImages: {
          count: randomImages.length,
          urls: randomImages
        }
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllProjects = async () => {
    setLoading(true);
    try {
      const results: any = {};
      
      for (const project of PROJECTS) {
        results[project] = {};
        for (const category of IMAGE_CATEGORIES) {
          try {
            const images = await getAvailableImages(project, category);
            results[project][category] = {
              count: images.length,
              success: true
            };
          } catch (error) {
            results[project][category] = {
              count: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        }
      }
      
      setTestResults({ allProjects: results });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Image Fetching Debugger
      </h2>

      {/* Environment Configuration */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Environment Configuration
        </h3>
        {configValidation && (
          <div className={`p-3 rounded ${configValidation.isValid ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <div className="font-medium mb-2">
              Status: {configValidation.isValid ? '✅ Valid' : '❌ Invalid'}
            </div>
            {configValidation.errors.length > 0 && (
              <ul className="list-disc list-inside text-sm">
                {configValidation.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-700 dark:text-red-300">{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Connection Test */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Supabase Connection Test
        </h3>
        <button
          onClick={runConnectionTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        {connectionTest && (
          <div className={`mt-3 p-3 rounded ${connectionTest.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <div className="font-medium mb-2">
              {connectionTest.success ? '✅ Success' : '❌ Failed'}
            </div>
            <div className="text-sm mb-2">{connectionTest.message}</div>
            {connectionTest.details && (
              <details className="text-xs">
                <summary className="cursor-pointer">View Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                  {JSON.stringify(connectionTest.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Image Fetching Test */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Image Fetching Test
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value as ProjectId)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {PROJECTS.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ImageCategory)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {IMAGE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={testImageFetching}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Single Project'}
          </button>
          <button
            onClick={testAllProjects}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test All Projects'}
          </button>
        </div>
        {testResults && Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-medium mb-2">Test Results:</div>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
          How to Use This Debugger
        </h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>Check if environment variables are properly set</li>
          <li>Test Supabase connection and bucket access</li>
          <li>Test image fetching for specific projects/categories</li>
          <li>Check browser console for detailed debug logs</li>
          <li>Verify image URLs are accessible in browser</li>
        </ol>
      </div>
    </div>
  );
} 
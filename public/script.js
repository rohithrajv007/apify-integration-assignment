document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const apiKeyInput = document.getElementById('apiKeyInput');
    const fetchActorsBtn = document.getElementById('fetchActorsBtn');
    const actorSelect = document.getElementById('actorSelect');
    const runActorBtn = document.getElementById('runActorBtn');
    const actorSelectionSection = document.getElementById('actorSelectionSection');
    const inputSchemaSection = document.getElementById('inputSchemaSection');
    const resultsSection = document.getElementById('resultsSection');
    const inputSchemaForm = document.getElementById('inputSchemaForm');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    const resultsOutput = document.getElementById('resultsOutput');
    const API_BASE_URL = 'http://localhost:3001/api';

    // --- Helper function for safe JSON parsing and error handling ---
    async function handleApiResponse(response) {
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            if (!response.ok) {
                 throw new Error(`Server returned status ${response.status} with an invalid response.`);
            }
            return null; 
        }

        if (!response.ok) {
            const err = new Error(data.error || 'An unknown error occurred.');
            err.details = data.details;
            throw err;
        }
        
        return data;
    }

    // --- Event Listeners ---

    fetchActorsBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showError('API key is required.');
            return;
        }
        hideError();
        resetUI();

        try {
            const response = await fetch(`${API_BASE_URL}/actors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey }),
            });
            const actors = await handleApiResponse(response);
            populateActorDropdown(actors);
            actorSelectionSection.classList.remove('hidden');
        } catch (error) {
            showError(error.message);
        }
    });

    actorSelect.addEventListener('change', async () => {
        const actorId = actorSelect.value;
        const apiKey = apiKeyInput.value.trim();

        if (!actorId) {
            inputSchemaSection.classList.add('hidden');
            resultsSection.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/actor-schema`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, actorId }),
            });
            const schema = await handleApiResponse(response);
            generateFormFromSchema(schema);
            inputSchemaSection.classList.remove('hidden');
            resultsSection.classList.add('hidden');
        } catch (error) {
            showError(error.message);
        }
    });

    runActorBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const actorId = actorSelect.value;
        const inputData = getFormData();

        if (inputData === null) return;

        if (!apiKey || !actorId) {
            showError('API Key and Actor ID are required.');
            return;
        }

        resultsSection.classList.remove('hidden');
        loader.classList.remove('hidden');
        resultsOutput.textContent = '';
        hideError();

        try {
            const response = await fetch(`${API_BASE_URL}/run-actor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, actorId, inputData }),
            });
            const result = await handleApiResponse(response);
            
            if (result) {
                 resultsOutput.textContent = JSON.stringify(result, null, 2);
            } else {
                throw new Error("Received an empty or invalid result from the actor run.");
            }
        } catch (error) {
            const errorMessageText = error.details ? JSON.stringify(error.details, null, 2) : error.message;
            showError(`Execution Failed: ${errorMessageText}`);
        } finally {
            loader.classList.add('hidden');
        }
    });

    // --- UI Helper Functions ---

    function populateActorDropdown(actors) {
        actorSelect.innerHTML = '<option value="">-- Please select an actor --</option>';
        if (!actors) return;
        actors.forEach(actor => {
            const option = document.createElement('option');
            option.value = actor.id;
            option.textContent = actor.name;
            actorSelect.appendChild(option);
        });
    }

    /**
     * *** UPDATED FUNCTION ***
     * Hides the pageFunction input from the UI.
     */
    function generateFormFromSchema(schema) {
        inputSchemaForm.innerHTML = '';

        // Handle the web-scraper case specifically for a better UI
        if (actorSelect.value.includes('web-scraper')) {
            // Create URL input field
            const urlGroup = document.createElement('div');
            urlGroup.className = 'input-group';
            const urlLabel = document.createElement('label');
            urlLabel.setAttribute('for', 'startUrlInput');
            urlLabel.textContent = 'Start URL';
            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.id = 'startUrlInput';
            urlInput.name = 'startUrlInput';
            urlInput.value = 'https://www.google.com';
            urlGroup.appendChild(urlLabel);
            urlGroup.appendChild(urlInput);
            inputSchemaForm.appendChild(urlGroup);
            
            // The pageFunction textarea is no longer created here, hiding it from the user.
            return;
        }
        
        // If there's no schema for other actors, provide a generic JSON input
        if (!schema || !schema.properties) {
            const formGroup = document.createElement('div');
            formGroup.className = 'input-group';
            const label = document.createElement('label');
            label.setAttribute('for', 'jsonInput');
            label.textContent = 'JSON Input';
            const textarea = document.createElement('textarea');
            textarea.id = 'jsonInput';
            textarea.name = 'jsonInput';
            textarea.placeholder = 'Enter actor input as a JSON object...';
            textarea.value = "{}";
            formGroup.appendChild(label);
            formGroup.appendChild(textarea);
            inputSchemaForm.appendChild(formGroup);
            return;
        }

        // Logic to generate form from properties (remains the same)
        for (const key in schema.properties) {
            const prop = schema.properties[key];
            const formGroup = document.createElement('div');
            formGroup.className = 'input-group';
            const label = document.createElement('label');
            label.setAttribute('for', key);
            label.textContent = prop.title || key;
            formGroup.appendChild(label);
            let input;
            if (prop.type === 'boolean') {
                input = document.createElement('select');
                input.innerHTML = `<option value="false">False</option><option value="true">True</option>`;
            } else if (prop.editor === 'textarea') {
                input = document.createElement('textarea');
                input.placeholder = prop.description || '';
            } else {
                input = document.createElement('input');
                input.type = prop.type === 'integer' ? 'number' : 'text';
                input.placeholder = prop.description || '';
            }
            input.id = key;
            input.name = key;
            if (prop.default) {
                input.value = prop.default;
            }
            formGroup.appendChild(input);
            inputSchemaForm.appendChild(formGroup);
        }
    }

    /**
     * *** UPDATED FUNCTION ***
     * Hardcodes the pageFunction when gathering form data.
     */
    function getFormData() {
        // Handle the specific web-scraper case
        const startUrlInput = document.getElementById('startUrlInput');
        if (startUrlInput) {
            // The pageFunction is now hardcoded here, not read from the UI.
            const pageFunction = "async function pageFunction(context) {\n    const { request, log, jQuery: $ } = context;\n    const title = $('title').text();\n    log.info(`URL: ${request.url}, Title: ${title}`);\n    return {\n        url: request.url,\n        title\n    };\n}";
            return {
                "startUrls": [{ "url": startUrlInput.value }],
                "pageFunction": pageFunction
            };
        }

        // Handle the generic JSON input case
        const jsonInput = document.getElementById('jsonInput');
        if (jsonInput) {
            try {
                return JSON.parse(jsonInput.value);
            } catch (e) {
                showError('Invalid JSON in the input field. Please correct it.');
                return null;
            }
        }

        // Original logic for standard forms
        const formData = {};
        const elements = inputSchemaForm.elements;
        for (let i = 0; i < elements.length; i++) {
            const item = elements[i];
            if (item.name) {
                if (item.type === 'number') {
                    formData[item.name] = parseFloat(item.value) || 0;
                } else if (item.tagName.toLowerCase() === 'select' && (item.value === 'true' || item.value === 'false')) {
                    formData[item.name] = item.value === 'true';
                } else {
                    formData[item.name] = item.value;
                }
            }
        }
        return formData;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        resultsSection.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function resetUI() {
        actorSelectionSection.classList.add('hidden');
        inputSchemaSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        actorSelect.innerHTML = '<option value="">-- Please select an actor --</option>';
        inputSchemaForm.innerHTML = '';
        resultsOutput.textContent = '';
    }
});
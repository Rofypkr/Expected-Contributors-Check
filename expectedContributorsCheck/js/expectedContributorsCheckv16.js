console.log('[ExpectedContributorsCheck] Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[ExpectedContributorsCheck] DOMContentLoaded fired');

    const observer = new MutationObserver(() => {
        if (!window.location.href.includes('#contributors')) return;

        const container = document.querySelector('.contributorsListPanel');
        if (!container || document.querySelector('#expectedContributorsWrapper')) return;

        console.log('[ExpectedContributorsCheck] Injecting input field');

        const html = `
            <div id="expectedContributorsWrapper" style="margin-bottom: 1.5rem; padding: 1.25rem; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <label for="expectedContributors" style="font-weight: 600; color: #495057; font-size: 0.95rem;">
                        Expected Number of Contributors
                        <span style="color: #6c757d; font-weight: normal; font-size: 0.85rem;">(required)</span>
                    </label>
                    <div style="position: relative;">
                        <input 
                            type="number" 
                            id="expectedContributors" 
                            min="1" 
                            required 
                            style="
                                padding: 0.5rem 0.75rem;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 0.95rem;
                                width: 80px;
                                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                            "
                            placeholder="0"
                        />
                        <div id="expectedContributorsStatus" style="
                            position: absolute;
                            right: -28px;
                            top: 50%;
                            transform: translateY(-50%);
                            width: 20px;
                            height: 20px;
                            display: none;
                        ">
                            <svg viewBox="0 0 20 20" width="20" height="20">
                                <path fill="currentColor" d="M10,0 C4.48,0 0,4.48 0,10 C0,15.52 4.48,20 10,20 C15.52,20 20,15.52 20,10 C20,4.48 15.52,0 10,0 Z M10,18 C5.58,18 2,14.42 2,10 C2,5.58 5.58,2 10,2 C14.42,2 18,5.58 18,10 C18,14.42 14.42,18 10,18 Z M9,13 L9,15 L11,15 L11,13 L9,13 Z M9,5 L9,11 L11,11 L11,5 L9,5 Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                <div id="expectedContributorsMessage" style="
                    font-size: 0.85rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 4px;
                    display: none;
                    margin-top: 0.5rem;
                    transition: all 0.2s ease;
                "></div>
                <div id="expectedContributorsSuccess" style="
                    font-size: 0.85rem;
                    color: #28a745;
                    padding: 0.5rem 0.75rem;
                    background-color: #e8f5e9;
                    border-radius: 4px;
                    display: none;
                    margin-top: 0.5rem;
                    transition: all 0.2s ease;
                ">
                    <svg viewBox="0 0 20 20" width="16" height="16" style="margin-right: 6px; vertical-align: middle;">
                        <path fill="currentColor" d="M10,0 C4.48,0 0,4.48 0,10 C0,15.52 4.48,20 10,20 C15.52,20 20,15.52 20,10 C20,4.48 15.52,0 10,0 Z M8,15 L3,10 L4.41,8.59 L8,12.17 L15.59,4.58 L17,6 L8,15 Z"></path>
                    </svg>
                    Contributor count matches expectation!
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforebegin', html);

        const continueBtn = document.querySelector('button.pkpButton.pkpButton--isPrimary');
        const inputField = document.getElementById('expectedContributors');
        const messageDiv = document.getElementById('expectedContributorsMessage');
        const successDiv = document.getElementById('expectedContributorsSuccess');
        const statusIcon = document.getElementById('expectedContributorsStatus');

        // Restore previous value if available
        const savedExpected = localStorage.getItem('expectedContributors');
        if (savedExpected) {
            inputField.value = savedExpected;
        }

        const validateContributors = () => {
            const expected = parseInt(inputField.value, 10);
            const actualContributors = document.querySelectorAll('.listPanel--contributor .listPanel__item').length;

            // Save input to localStorage
            localStorage.setItem('expectedContributors', inputField.value);

            // Clear previous states
            messageDiv.style.display = 'none';
            successDiv.style.display = 'none';
            statusIcon.style.display = 'none';
            inputField.style.borderColor = '#ced4da';
            inputField.style.boxShadow = 'none';

            if (!inputField.value || isNaN(expected) || expected < 1) {
                messageDiv.textContent = 'Please enter a valid number greater than 0.';
                messageDiv.style.display = 'block';
                messageDiv.style.color = '#dc3545';
                messageDiv.style.backgroundColor = '#f8d7da';
                statusIcon.style.display = 'block';
                statusIcon.querySelector('svg path').setAttribute('fill', '#dc3545');
                inputField.style.borderColor = '#dc3545';
                inputField.style.boxShadow = '0 0 0 0.2rem rgba(220,53,69,0.25)';
                
                if (continueBtn) {
                    continueBtn.disabled = true;
                    continueBtn.style.opacity = 0.6;
                    continueBtn.style.cursor = 'not-allowed';
                }
                return;
            }

            if (actualContributors !== expected) {
                messageDiv.textContent = `Expected ${expected} contributor(s), but found ${actualContributors}. Please adjust your contributors list.`;
                messageDiv.style.display = 'block';
                messageDiv.style.color = '#ffc107';
                messageDiv.style.backgroundColor = '#fff3cd';
                statusIcon.style.display = 'block';
                statusIcon.querySelector('svg path').setAttribute('fill', '#ffc107');
                inputField.style.borderColor = '#ffc107';
                inputField.style.boxShadow = '0 0 0 0.2rem rgba(255,193,7,0.25)';
                
                if (continueBtn) {
                    continueBtn.disabled = true;
                    continueBtn.style.opacity = 0.6;
                    continueBtn.style.cursor = 'not-allowed';
                }
                return;
            }

            // Success state
            successDiv.style.display = 'block';
            statusIcon.style.display = 'block';
            statusIcon.querySelector('svg path').setAttribute('fill', '#28a745');
            inputField.style.borderColor = '#28a745';
            inputField.style.boxShadow = '0 0 0 0.2rem rgba(40,167,69,0.25)';
            
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.style.opacity = 1;
                continueBtn.style.cursor = 'pointer';
            }
        };

        // Add focus/blur effects
        inputField.addEventListener('focus', () => {
            inputField.style.borderColor = '#80bdff';
            inputField.style.boxShadow = '0 0 0 0.2rem rgba(0,123,255,0.25)';
        });

        inputField.addEventListener('blur', () => {
            if (inputField.value && !isNaN(parseInt(inputField.value, 10)) && parseInt(inputField.value, 10) > 0) {
                inputField.style.borderColor = '#28a745';
                inputField.style.boxShadow = '0 0 0 0.2rem rgba(40,167,69,0.25)';
            } else {
                inputField.style.borderColor = '#ced4da';
                inputField.style.boxShadow = 'none';
            }
        });

        inputField.addEventListener('input', validateContributors);

        // Observe changes in the entire contributors list area
        const contributorsArea = document.querySelector('.listPanel--contributor');
        if (contributorsArea) {
            const contributorObserver = new MutationObserver(validateContributors);
            contributorObserver.observe(contributorsArea, {
                childList: true,
                subtree: true,
            });
        }

        // Initial validation in case data is already loaded
        validateContributors();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
});
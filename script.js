// Game state
        let questions = [];
        let categories = ["General Knowledge", "Science", "History", "Geography", "Entertainment", "Sports"];
        let currentQuestion = 0;
        let score = 0;
        let playerName = "Guest";
        let timer;
        let timeLeft = 30;
        let isAdmin = false;
        let gameSettings = {
            questionTimer: 30,
            questionsPerGame: 10,
            defaultDifficulty: "mixed",
            selectedCategories: [],
            leaderboardSize: 10,
            theme: "default",
            fontSize: "medium",
            animationSpeed: "normal"
        };
        let parentalControls = {
            contentFiltering: false,
            allowedCategories: [],
            maxDifficulty: "hard",
            timeLimits: false,
            dailyLimit: 60,
            sessionLimit: 30,
            bedtimeStart: "21:00",
            bedtimeEnd: "07:00",
            allowSharing: true,
            showNames: true,
            requireApproval: false
        };
        let activeSession = null;
        
        // Sample questions for initial setup
        const sampleQuestions = [
            {
                id: 1,
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correctAnswer: 2,
                category: "Geography",
                difficulty: "easy",
                explanation: "Paris is the capital and most populous city of France."
            },
            {
                id: 2,
                question: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Jupiter", "Venus"],
                correctAnswer: 1,
                category: "Science",
                difficulty: "easy",
                explanation: "Mars is often referred to as the Red Planet because of its reddish appearance."
            },
            {
                id: 3,
                question: "Who wrote 'Romeo and Juliet'?",
                options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                correctAnswer: 1,
                category: "Literature",
                difficulty: "medium",
                explanation: "William Shakespeare wrote the tragic play 'Romeo and Juliet'."
            },
            {
                id: 4,
                question: "What is the largest mammal in the world?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                correctAnswer: 1,
                category: "Science",
                difficulty: "medium",
                explanation: "The blue whale is the largest mammal on Earth."
            },
            {
                id: 5,
                question: "In which year did World War II end?",
                options: ["1943", "1945", "1947", "1950"],
                correctAnswer: 1,
                category: "History",
                difficulty: "medium",
                explanation: "World War II ended in 1945 with the surrender of Germany and Japan."
            }
        ];
        
        // Initialize the game
        function initGame() {
            // Load questions from localStorage or use sample questions
            const savedQuestions = localStorage.getItem('familyQuizQuestions');
            if (savedQuestions) {
                questions = JSON.parse(savedQuestions);
            } else {
                questions = sampleQuestions;
                saveQuestions();
            }
            
            // Load categories
            const savedCategories = localStorage.getItem('familyQuizCategories');
            if (savedCategories) {
                categories = JSON.parse(savedCategories);
            } else {
                saveCategories();
            }
            
            // Load settings
            const savedSettings = localStorage.getItem('familyQuizSettings');
            if (savedSettings) {
                gameSettings = JSON.parse(savedSettings);
            } else {
                saveSettings();
            }
            
            // Load parental controls
            const savedParentalControls = localStorage.getItem('familyQuizParentalControls');
            if (savedParentalControls) {
                parentalControls = JSON.parse(savedParentalControls);
            } else {
                saveParentalControls();
            }
            
            // Load leaderboard
            loadLeaderboard();
            
            // Set up event listeners
            setupEventListeners();
            
            // Update UI
            updateTotalQuestions();
            updateCategoriesUI();
            updateSettingsUI();
            updateParentalControlsUI();
            
            // Apply initial theme
            applyTheme(gameSettings.theme);
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Welcome screen
            document.getElementById('play-game').addEventListener('click', startGame);
            document.getElementById('player-name-input').addEventListener('input', updatePlayerName);
            
            // Game controls
            document.getElementById('start-game').addEventListener('click', startGame);
            document.getElementById('host-game').addEventListener('click', showAdminDashboard);
            document.getElementById('reset-game').addEventListener('click', resetGame);
            document.getElementById('next-question').addEventListener('click', nextQuestion);
            document.getElementById('play-again').addEventListener('click', playAgain);
            
            // Admin controls
            document.getElementById('admin-login').addEventListener('click', showAdminLogin);
            document.getElementById('login-submit').addEventListener('click', adminLogin);
            document.getElementById('login-cancel').addEventListener('click', hideAdminLogin);
            
            // Admin dashboard
            document.getElementById('close-admin-dashboard').addEventListener('click', hideAdminDashboard);
            
            // Tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', switchTab);
            });
            
            // Hosting controls
            document.getElementById('start-session').addEventListener('click', startSession);
            document.getElementById('stop-session').addEventListener('click', stopSession);
            document.getElementById('generate-qr').addEventListener('click', generateQRCode);
            
            // Question management
            document.getElementById('add-new-question').addEventListener('click', showAddQuestionModal);
            document.getElementById('save-question').addEventListener('click', saveQuestion);
            document.getElementById('cancel-question').addEventListener('click', hideAddQuestionModal);
            document.getElementById('apply-filters').addEventListener('click', updateQuestionList);
            
            // Category management
            document.getElementById('add-category').addEventListener('click', addCategory);
            
            // Settings
            document.getElementById('save-settings').addEventListener('click', saveSettings);
            document.getElementById('save-parental-controls').addEventListener('click', saveParentalControls);
            
            // Share buttons
            document.getElementById('share-whatsapp').addEventListener('click', shareWhatsApp);
            document.getElementById('share-facebook').addEventListener('click', shareFacebook);
            document.getElementById('copy-link').addEventListener('click', copyLink);
        }
        
        // Start the game
        function startGame() {
            if (questions.length === 0) {
                alert('No questions available. Please add questions first.');
                return;
            }
            
            // Hide welcome screen, show question section
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('question-section').classList.remove('hidden');
            
            // Reset game state
            currentQuestion = 0;
            score = 0;
            updateScore();
            
            // Display first question
            displayQuestion();
        }
        
        // Display current question
        function displayQuestion() {
            const question = questions[currentQuestion];
            const questionElement = document.getElementById('question');
            const optionsElement = document.getElementById('options');
            
            // Update question counter
            document.getElementById('current-question').textContent = currentQuestion + 1;
            
            // Set question text
            questionElement.textContent = question.question;
            
            // Clear previous options
            optionsElement.innerHTML = '';
            
            // Create option buttons
            question.options.forEach((option, index) => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                
                button.textContent = option;
                button.dataset.index = index;
                button.addEventListener('click', checkAnswer);
                
                li.appendChild(button);
                optionsElement.appendChild(li);
            });
            
            // Start timer
            startTimer();
        }
        
        // Start the timer for the current question
        function startTimer() {
            timeLeft = gameSettings.questionTimer;
            document.getElementById('timer').textContent = `${timeLeft}s`;
            document.getElementById('timer').classList.remove('warning');
            
            clearInterval(timer);
            timer = setInterval(() => {
                timeLeft--;
                document.getElementById('timer').textContent = `${timeLeft}s`;
                
                // Add warning class when time is running low
                if (timeLeft <= 10) {
                    document.getElementById('timer').classList.add('warning');
                }
                
                // Time's up
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    handleTimeUp();
                }
            }, 1000);
        }
        
        // Handle when time runs out
        function handleTimeUp() {
            const question = questions[currentQuestion];
            const options = document.querySelectorAll('#options button');
            
            // Disable all options
            options.forEach(button => {
                button.disabled = true;
            });
            
            // Highlight correct answer
            options[question.correctAnswer].classList.add('correct');
            
            // Show result
            showResult(false, question.options[question.correctAnswer], question.explanation);
        }
        
        // Check the selected answer
        function checkAnswer(event) {
            const selectedButton = event.target;
            const selectedIndex = parseInt(selectedButton.dataset.index);
            const question = questions[currentQuestion];
            
            // Stop the timer
            clearInterval(timer);
            
            // Disable all options
            const options = document.querySelectorAll('#options button');
            options.forEach(button => {
                button.disabled = true;
            });
            
            // Check if answer is correct
            const isCorrect = selectedIndex === question.correctAnswer;
            
            // Highlight correct and incorrect answers
            options.forEach((button, index) => {
                if (index === question.correctAnswer) {
                    button.classList.add('correct');
                } else if (index === selectedIndex && !isCorrect) {
                    button.classList.add('incorrect');
                }
            });
            
            // Update score if correct
            if (isCorrect) {
                score++;
                updateScore();
                createConfetti();
            }
            
            // Show result
            showResult(isCorrect, question.options[question.correctAnswer], question.explanation);
        }
        
        // Show result after answering
        function showResult(isCorrect, correctAnswer, explanation) {
            const resultElement = document.getElementById('result');
            
            if (isCorrect) {
                resultElement.textContent = "Correct! Well done!";
                resultElement.className = "correct-answer";
            } else {
                resultElement.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
                resultElement.className = "incorrect-answer";
            }
            
            // Add explanation if available
            if (explanation) {
                const explanationElement = document.createElement('p');
                explanationElement.textContent = explanation;
                explanationElement.style.marginTop = '10px';
                explanationElement.style.fontStyle = 'italic';
                resultElement.appendChild(explanationElement);
            }
            
            // Hide question section, show result section
            document.getElementById('question-section').classList.add('hidden');
            document.getElementById('result-section').classList.remove('hidden');
        }
        
        // Move to next question
        function nextQuestion() {
            currentQuestion++;
            
            // Check if game is over
            if (currentQuestion >= Math.min(gameSettings.questionsPerGame, questions.length)) {
                endGame();
            } else {
                // Show next question
                document.getElementById('result-section').classList.add('hidden');
                document.getElementById('question-section').classList.remove('hidden');
                displayQuestion();
            }
        }
        
        // End the game
        function endGame() {
            // Update leaderboard
            updateLeaderboard();
            
            // Show game over screen
            document.getElementById('result-section').classList.add('hidden');
            document.getElementById('game-over').classList.remove('hidden');
            
            // Update final score and player name
            document.getElementById('final-score').textContent = score;
            document.getElementById('final-player-name').textContent = playerName;
            
            // Update final leaderboard
            updateFinalLeaderboard();
        }
        
        // Play again
        function playAgain() {
            // Reset to welcome screen
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('welcome-screen').classList.remove('hidden');
        }
        
        // Reset the game
        function resetGame() {
            // Reset game state
            currentQuestion = 0;
            score = 0;
            updateScore();
            
            // Show welcome screen
            document.getElementById('question-section').classList.add('hidden');
            document.getElementById('result-section').classList.add('hidden');
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('welcome-screen').classList.remove('hidden');
        }
        
        // Update score display
        function updateScore() {
            document.getElementById('score').textContent = score;
        }
        
        // Update total questions display
        function updateTotalQuestions() {
            document.getElementById('total-questions').textContent = questions.length;
        }
        
        // Update player name
        function updatePlayerName() {
            playerName = document.getElementById('player-name-input').value || "Guest";
            document.getElementById('player-name').textContent = playerName;
        }
        
        // Show admin login modal
        function showAdminLogin() {
            document.getElementById('admin-login-modal').style.display = 'flex';
        }
        
        // Hide admin login modal
        function hideAdminLogin() {
            document.getElementById('admin-login-modal').style.display = 'none';
            document.getElementById('admin-password').value = '';
        }
        
        // Admin login
        function adminLogin() {
            const password = document.getElementById('admin-password').value;
            
            if (password === "#admin") {
                isAdmin = true;
                alert("Admin access granted!");
                hideAdminLogin();
                showAdminDashboard();
            } else {
                alert("Incorrect password. Please try again.");
            }
        }
        
        // Show admin dashboard
        function showAdminDashboard() {
            if (!isAdmin) {
                showAdminLogin();
                return;
            }
            
            document.getElementById('admin-dashboard-modal').style.display = 'flex';
            updateQuestionList();
            updateSessionCode();
        }
        
        // Hide admin dashboard
        function hideAdminDashboard() {
            document.getElementById('admin-dashboard-modal').style.display = 'none';
        }
        
        // Switch between tabs in admin dashboard
        function switchTab(event) {
            const tabId = event.target.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        }
        
        // Start a game session
        function startSession() {
            const sessionName = document.getElementById('session-name').value || "Family Quiz";
            const maxPlayers = document.getElementById('max-players').value || 8;
            
            activeSession = {
                id: generateSessionCode(),
                name: sessionName,
                maxPlayers: maxPlayers,
                players: [],
                status: 'active',
                startTime: new Date()
            };
            
            updateSessionUI();
            alert(`Session "${sessionName}" started! Share the code: ${activeSession.id}`);
        }
        
        // Stop the current session
        function stopSession() {
            if (activeSession) {
                activeSession.status = 'ended';
                activeSession.endTime = new Date();
                updateSessionUI();
                alert(`Session "${activeSession.name}" has been ended.`);
                activeSession = null;
            }
        }
        
        // Generate a session code
        function generateSessionCode() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
        
        // Update session code display
        function updateSessionCode() {
            if (activeSession) {
                document.getElementById('session-code-display').textContent = activeSession.id;
                document.getElementById('session-status').textContent = `Active: ${activeSession.name}`;
            } else {
                document.getElementById('session-code-display').textContent = "FAM-1234";
                document.getElementById('session-status').textContent = "No active session";
            }
        }
        
        // Generate QR code for session
        function generateQRCode() {
            if (!activeSession) {
                alert("Please start a session first!");
                return;
            }
            
            const qrContainer = document.getElementById('qr-code');
            // In a real app, you would use a QR code library here
            // For this example, we'll just display a placeholder
            qrContainer.innerHTML = `
                <div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">${activeSession.id}</div>
                        <div>Scan to join</div>
                    </div>
                </div>
            `;
            
            document.getElementById('qr-code-container').classList.remove('hidden');
        }
        
        // Update session UI
        function updateSessionUI() {
            updateSessionCode();
            
            const playersList = document.getElementById('players-list');
            playersList.innerHTML = '';
            
            if (activeSession && activeSession.players.length > 0) {
                activeSession.players.forEach(player => {
                    const li = document.createElement('li');
                    li.textContent = player.name;
                    playersList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No players connected yet';
                playersList.appendChild(li);
            }
            
            document.getElementById('connected-players').querySelector('h4').textContent = 
                `Connected Players (${activeSession ? activeSession.players.length : 0})`;
        }
        
        // Show add question modal
        function showAddQuestionModal() {
            document.getElementById('add-question-modal').style.display = 'flex';
            populateCategorySelect();
            clearQuestionForm();
        }
        
        // Hide add question modal
        function hideAddQuestionModal() {
            document.getElementById('add-question-modal').style.display = 'none';
            clearQuestionForm();
        }
        
        // Populate category select dropdown
        function populateCategorySelect() {
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = '';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        
        // Save new question
        function saveQuestion() {
            const questionText = document.getElementById('question-text').value;
            const category = document.getElementById('category').value;
            const difficulty = document.getElementById('difficulty').value;
            const option1 = document.getElementById('option1').value;
            const option2 = document.getElementById('option2').value;
            const option3 = document.getElementById('option3').value;
            const option4 = document.getElementById('option4').value;
            const explanation = document.getElementById('explanation').value;
            
            // Validate inputs
            if (!questionText || !option1 || !option2 || !option3 || !option4) {
                alert("Please fill in all required fields.");
                return;
            }
            
            // Create new question object
            const newQuestion = {
                id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
                question: questionText,
                options: [option1, option2, option3, option4],
                correctAnswer: 0, // First option is always correct in this form
                category: category,
                difficulty: difficulty,
                explanation: explanation
            };
            
            // Add to questions array
            questions.push(newQuestion);
            
            // Save to localStorage
            saveQuestions();
            
            // Update UI
            updateTotalQuestions();
            updateQuestionList();
            
            // Clear form and close modal
            clearQuestionForm();
            hideAddQuestionModal();
            
            alert("Question added successfully!");
        }
        
        // Clear question form
        function clearQuestionForm() {
            document.getElementById('question-text').value = '';
            document.getElementById('option1').value = '';
            document.getElementById('option2').value = '';
            document.getElementById('option3').value = '';
            document.getElementById('option4').value = '';
            document.getElementById('explanation').value = '';
        }
        
        // Update question list in admin panel
        function updateQuestionList() {
            const container = document.getElementById('question-list-container');
            container.innerHTML = '';
            
            const categoryFilter = document.getElementById('filter-category').value;
            const difficultyFilter = document.getElementById('filter-difficulty').value;
            
            const filteredQuestions = questions.filter(question => {
                return (categoryFilter === 'all' || question.category === categoryFilter) &&
                       (difficultyFilter === 'all' || question.difficulty === difficultyFilter);
            });
            
            if (filteredQuestions.length === 0) {
                container.innerHTML = '<p>No questions found matching your filters.</p>';
                return;
            }
            
            filteredQuestions.forEach((question, index) => {
                const item = document.createElement('div');
                item.className = 'question-preview';
                
                const header = document.createElement('div');
                header.className = 'question-preview-header';
                
                const questionNumber = document.createElement('span');
                questionNumber.textContent = `Q${index + 1}: ${question.question}`;
                questionNumber.style.fontWeight = 'bold';
                
                const meta = document.createElement('div');
                meta.innerHTML = `
                    <span class="question-level level-${question.difficulty}">${question.difficulty.toUpperCase()}</span>
                    <span> | ${question.category}</span>
                `;
                
                header.appendChild(questionNumber);
                header.appendChild(meta);
                
                const options = document.createElement('div');
                options.innerHTML = `
                    <p><strong>Options:</strong></p>
                    <ol>
                        ${question.options.map((option, i) => `
                            <li style="${i === question.correctAnswer ? 'color: green; font-weight: bold;' : ''}">
                                ${option} ${i === question.correctAnswer ? ' (Correct)' : ''}
                            </li>
                        `).join('')}
                    </ol>
                `;
                
                const actions = document.createElement('div');
                actions.style.marginTop = '10px';
                actions.innerHTML = `
                    <button class="btn-secondary edit-question" data-id="${question.id}">Edit</button>
                    <button class="btn-danger delete-question" data-id="${question.id}">Delete</button>
                `;
                
                item.appendChild(header);
                item.appendChild(options);
                if (question.explanation) {
                    const explanation = document.createElement('p');
                    explanation.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
                    explanation.style.fontStyle = 'italic';
                    item.appendChild(explanation);
                }
                item.appendChild(actions);
                
                container.appendChild(item);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-question').forEach(button => {
                button.addEventListener('click', (e) => {
                    const questionId = parseInt(e.target.dataset.id);
                    editQuestion(questionId);
                });
            });
            
            document.querySelectorAll('.delete-question').forEach(button => {
                button.addEventListener('click', (e) => {
                    const questionId = parseInt(e.target.dataset.id);
                    deleteQuestion(questionId);
                });
            });
        }
        
        // Edit a question
        function editQuestion(id) {
            const question = questions.find(q => q.id === id);
            if (!question) return;
            
            // Populate the form with question data
            document.getElementById('question-text').value = question.question;
            document.getElementById('category').value = question.category;
            document.getElementById('difficulty').value = question.difficulty;
            document.getElementById('option1').value = question.options[0];
            document.getElementById('option2').value = question.options[1];
            document.getElementById('option3').value = question.options[2];
            document.getElementById('option4').value = question.options[3];
            document.getElementById('explanation').value = question.explanation || '';
            
            // Change the save button to update
            const saveButton = document.getElementById('save-question');
            saveButton.textContent = 'Update Question';
            saveButton.onclick = () => updateQuestion(id);
            
            // Show the modal
            document.getElementById('add-question-modal').style.display = 'flex';
        }
        
        // Update an existing question
        function updateQuestion(id) {
            const questionIndex = questions.findIndex(q => q.id === id);
            if (questionIndex === -1) return;
            
            const questionText = document.getElementById('question-text').value;
            const category = document.getElementById('category').value;
            const difficulty = document.getElementById('difficulty').value;
            const option1 = document.getElementById('option1').value;
            const option2 = document.getElementById('option2').value;
            const option3 = document.getElementById('option3').value;
            const option4 = document.getElementById('option4').value;
            const explanation = document.getElementById('explanation').value;
            
            // Validate inputs
            if (!questionText || !option1 || !option2 || !option3 || !option4) {
                alert("Please fill in all required fields.");
                return;
            }
            
            // Update the question
            questions[questionIndex] = {
                ...questions[questionIndex],
                question: questionText,
                options: [option1, option2, option3, option4],
                category: category,
                difficulty: difficulty,
                explanation: explanation
            };
            
            // Save to localStorage
            saveQuestions();
            
            // Update UI
            updateQuestionList();
            
            // Reset the form and close modal
            hideAddQuestionModal();
            
            alert("Question updated successfully!");
        }
        
        // Delete a question
        function deleteQuestion(id) {
            if (confirm("Are you sure you want to delete this question?")) {
                questions = questions.filter(q => q.id !== id);
                saveQuestions();
                updateTotalQuestions();
                updateQuestionList();
            }
        }
        
        // Add a new category
        function addCategory() {
            const newCategory = document.getElementById('new-category').value.trim();
            if (!newCategory) {
                alert("Please enter a category name.");
                return;
            }
            
            if (categories.includes(newCategory)) {
                alert("This category already exists.");
                return;
            }
            
            categories.push(newCategory);
            saveCategories();
            updateCategoriesUI();
            
            document.getElementById('new-category').value = '';
            alert(`Category "${newCategory}" added successfully!`);
        }
        
        // Update categories UI
        function updateCategoriesUI() {
            // Update categories list
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = '';
            
            categories.forEach(category => {
                const item = document.createElement('div');
                item.className = 'question-item';
                
                const categoryName = document.createElement('div');
                categoryName.textContent = category;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-danger';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => deleteCategory(category));
                
                item.appendChild(categoryName);
                item.appendChild(deleteBtn);
                categoriesList.appendChild(item);
            });
            
            // Update category dropdowns
            populateCategorySelect();
            updateCategoryFilters();
        }
        
        // Update category filters
        function updateCategoryFilters() {
            const filterCategory = document.getElementById('filter-category');
            const gameCategories = document.getElementById('game-categories');
            const allowedCategories = document.getElementById('allowed-categories');
            
            // Clear existing options
            filterCategory.innerHTML = '<option value="all">All Categories</option>';
            gameCategories.innerHTML = '';
            allowedCategories.innerHTML = '';
            
            // Add categories to all dropdowns
            categories.forEach(category => {
                // Filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category;
                filterCategory.appendChild(filterOption);
                
                // Game categories checkboxes
                const gameCategoryLabel = document.createElement('label');
                gameCategoryLabel.style.display = 'block';
                gameCategoryLabel.innerHTML = `
                    <input type="checkbox" value="${category}" ${gameSettings.selectedCategories.includes(category) ? 'checked' : ''}>
                    ${category}
                `;
                gameCategories.appendChild(gameCategoryLabel);
                
                // Allowed categories checkboxes
                const allowedCategoryLabel = document.createElement('label');
                allowedCategoryLabel.style.display = 'block';
                allowedCategoryLabel.innerHTML = `
                    <input type="checkbox" value="${category}" ${parentalControls.allowedCategories.includes(category) ? 'checked' : ''}>
                    ${category}
                `;
                allowedCategories.appendChild(allowedCategoryLabel);
            });
        }
        
        // Delete a category
        function deleteCategory(category) {
            if (confirm(`Are you sure you want to delete the category "${category}"? This will also remove all questions in this category.`)) {
                // Remove category from categories list
                categories = categories.filter(c => c !== category);
                
                // Remove questions in this category
                questions = questions.filter(q => q.category !== category);
                
                // Save changes
                saveCategories();
                saveQuestions();
                
                // Update UI
                updateCategoriesUI();
                updateQuestionList();
                updateTotalQuestions();
            }
        }
        
        // Save questions to localStorage
        function saveQuestions() {
            localStorage.setItem('familyQuizQuestions', JSON.stringify(questions));
        }
        
        // Save categories to localStorage
        function saveCategories() {
            localStorage.setItem('familyQuizCategories', JSON.stringify(categories));
        }
        
        // Save settings to localStorage
        function saveSettings() {
            // Get values from form
            gameSettings.questionTimer = parseInt(document.getElementById('question-timer').value) || 30;
            gameSettings.questionsPerGame = parseInt(document.getElementById('questions-per-game').value) || 10;
            gameSettings.defaultDifficulty = document.getElementById('game-difficulty').value;
            
            // Get selected categories
            gameSettings.selectedCategories = [];
            document.querySelectorAll('#game-categories input:checked').forEach(checkbox => {
                gameSettings.selectedCategories.push(checkbox.value);
            });
            
            // Get other settings
            const newPassword = document.getElementById('admin-password-change').value;
            if (newPassword) {
                // In a real app, you would hash this password
                localStorage.setItem('familyQuizAdminPassword', newPassword);
            }
            
            gameSettings.leaderboardSize = parseInt(document.getElementById('leaderboard-size').value) || 10;
            gameSettings.theme = document.getElementById('theme-select').value;
            gameSettings.fontSize = document.getElementById('font-size').value;
            gameSettings.animationSpeed = document.getElementById('animation-speed').value;
            
            // Save to localStorage
            localStorage.setItem('familyQuizSettings', JSON.stringify(gameSettings));
            
            // Apply theme
            applyTheme(gameSettings.theme);
            
            alert("Settings saved successfully!");
        }
        
        // Update settings UI
        function updateSettingsUI() {
            document.getElementById('question-timer').value = gameSettings.questionTimer;
            document.getElementById('questions-per-game').value = gameSettings.questionsPerGame;
            document.getElementById('game-difficulty').value = gameSettings.defaultDifficulty;
            document.getElementById('leaderboard-size').value = gameSettings.leaderboardSize;
            document.getElementById('theme-select').value = gameSettings.theme;
            document.getElementById('font-size').value = gameSettings.fontSize;
            document.getElementById('animation-speed').value = gameSettings.animationSpeed;
            
            updateCategoryFilters();
        }
        
        // Save parental controls to localStorage
        function saveParentalControls() {
            // Get values from form
            parentalControls.contentFiltering = document.getElementById('content-filtering').checked;
            
            // Get allowed categories
            parentalControls.allowedCategories = [];
            document.querySelectorAll('#allowed-categories input:checked').forEach(checkbox => {
                parentalControls.allowedCategories.push(checkbox.value);
            });
            
            parentalControls.maxDifficulty = document.getElementById('max-difficulty').value;
            parentalControls.timeLimits = document.getElementById('time-limits').checked;
            parentalControls.dailyLimit = parseInt(document.getElementById('daily-limit').value) || 60;
            parentalControls.sessionLimit = parseInt(document.getElementById('session-limit').value) || 30;
            parentalControls.bedtimeStart = document.getElementById('bedtime-start').value;
            parentalControls.bedtimeEnd = document.getElementById('bedtime-end').value;
            parentalControls.allowSharing = document.getElementById('allow-sharing').checked;
            parentalControls.showNames = document.getElementById('show-names').checked;
            parentalControls.requireApproval = document.getElementById('require-approval').checked;
            
            // Save to localStorage
            localStorage.setItem('familyQuizParentalControls', JSON.stringify(parentalControls));
            
            alert("Parental controls saved successfully!");
        }
        
        // Update parental controls UI
        function updateParentalControlsUI() {
            document.getElementById('content-filtering').checked = parentalControls.contentFiltering;
            document.getElementById('max-difficulty').value = parentalControls.maxDifficulty;
            document.getElementById('time-limits').checked = parentalControls.timeLimits;
            document.getElementById('daily-limit').value = parentalControls.dailyLimit;
            document.getElementById('session-limit').value = parentalControls.sessionLimit;
            document.getElementById('bedtime-start').value = parentalControls.bedtimeStart;
            document.getElementById('bedtime-end').value = parentalControls.bedtimeEnd;
            document.getElementById('allow-sharing').checked = parentalControls.allowSharing;
            document.getElementById('show-names').checked = parentalControls.showNames;
            document.getElementById('require-approval').checked = parentalControls.requireApproval;
            
            updateCategoryFilters();
        }
        
        // Apply theme to the app
        function applyTheme(theme) {
            // Remove existing theme classes
            document.body.classList.remove('theme-dark', 'theme-colorful');
            
            // Add new theme class
            if (theme !== 'default') {
                document.body.classList.add(`theme-${theme}`);
            }
            
            // In a real app, you would have more comprehensive theming
            if (theme === 'dark') {
                document.body.style.backgroundColor = '#2c3e50';
                document.body.style.color = '#ecf0f1';
            } else if (theme === 'colorful') {
                document.body.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)';
            } else {
                document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                document.body.style.color = '#343a40';
            }
        }
        
        // Load leaderboard from localStorage
        function loadLeaderboard() {
            const leaderboard = JSON.parse(localStorage.getItem('familyQuizLeaderboard')) || [];
            updateLeaderboardDisplay(leaderboard, 'leaderboard-list');
        }
        
        // Update leaderboard with current score
        function updateLeaderboard() {
            let leaderboard = JSON.parse(localStorage.getItem('familyQuizLeaderboard')) || [];
            
            // Add current player's score
            leaderboard.push({
                name: playerName,
                score: score,
                date: new Date().toLocaleDateString()
            });
            
            // Sort by score (descending)
            leaderboard.sort((a, b) => b.score - a.score);
            
            // Keep only top scores
            leaderboard = leaderboard.slice(0, gameSettings.leaderboardSize);
            
            // Save to localStorage
            localStorage.setItem('familyQuizLeaderboard', JSON.stringify(leaderboard));
        }
        
        // Update leaderboard display
        function updateLeaderboardDisplay(leaderboard, elementId) {
            const list = document.getElementById(elementId);
            list.innerHTML = '';
            
            if (leaderboard.length === 0) {
                const item = document.createElement('li');
                item.className = 'leaderboard-item';
                item.textContent = 'No scores yet. Be the first!';
                list.appendChild(item);
                return;
            }
            
            leaderboard.forEach((entry, index) => {
                const item = document.createElement('li');
                item.className = 'leaderboard-item';
                
                const nameSpan = document.createElement('span');
                // Respect parental control setting for showing names
                if (!parentalControls.showNames && !isAdmin) {
                    nameSpan.textContent = `${index + 1}. Player ${index + 1}`;
                } else {
                    nameSpan.textContent = `${index + 1}. ${entry.name}`;
                }
                
                const scoreSpan = document.createElement('span');
                scoreSpan.textContent = `${entry.score} points`;
                
                item.appendChild(nameSpan);
                item.appendChild(scoreSpan);
                list.appendChild(item);
            });
        }
        
        // Update final leaderboard
        function updateFinalLeaderboard() {
            const leaderboard = JSON.parse(localStorage.getItem('familyQuizLeaderboard')) || [];
            updateLeaderboardDisplay(leaderboard, 'final-leaderboard');
        }
        
        // Create confetti effect
        function createConfetti() {
            const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
            
            // Add CSS for confetti animation
            if (!document.getElementById('confetti-style')) {
                const style = document.createElement('style');
                style.id = 'confetti-style';
                style.textContent = `
                    @keyframes fall {
                        0% {
                            transform: translateY(-100px) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Share functions
        function shareWhatsApp() {
            if (!parentalControls.allowSharing) {
                alert("Sharing is disabled by parental controls.");
                return;
            }
            
            const text = `I scored ${score} points in the Family Quiz Challenge! Can you beat my score?`;
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        }
        
        function shareFacebook() {
            if (!parentalControls.allowSharing) {
                alert("Sharing is disabled by parental controls.");
                return;
            }
            
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
        
        function copyLink() {
            if (!parentalControls.allowSharing) {
                alert("Sharing is disabled by parental controls.");
                return;
            }
            
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
        }
        
        // Initialize the game when the page loads
        window.addEventListener('DOMContentLoaded', initGame);
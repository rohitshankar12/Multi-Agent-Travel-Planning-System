let currentThreadId = localStorage.getItem("travel_thread_id") || null;
        let latestAnswerMarkdown = "";

        function setPrompt(text) {
            document.getElementById("userInput").value = text;
        }

        function setLoading(isLoading) {
            const sendBtn = document.getElementById("sendBtn");
            const btnText = document.getElementById("btnText");
            const btnLoader = document.getElementById("btnLoader");

            sendBtn.disabled = isLoading;

            if (isLoading) {
                btnText.classList.add("hidden");
                btnLoader.classList.remove("hidden");
            } else {
                btnText.classList.remove("hidden");
                btnLoader.classList.add("hidden");
            }
        }

        function showError(message) {
            const errorBox = document.getElementById("errorBox");
            errorBox.textContent = message;
            errorBox.classList.remove("hidden");
        }

        function hideError() {
            const errorBox = document.getElementById("errorBox");
            errorBox.classList.add("hidden");
            errorBox.textContent = "";
        }

        function showResult(answer, threadId) {
            latestAnswerMarkdown = answer;

            const resultSection = document.getElementById("resultSection");
            const resultBox = document.getElementById("resultBox");
            const threadInfo = document.getElementById("threadInfo");

            if (typeof marked !== "undefined") {
                resultBox.innerHTML = marked.parse(answer);
            } else {
                resultBox.innerText = answer;
            }

            if(threadId) {
                threadInfo.textContent = `Thread ID: ${threadId}`;
            }

            resultSection.classList.remove("hidden");

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        async function sendMessage() {
            hideError();

            const input = document.getElementById("userInput");
            const message = input.value.trim();

            if (!message) {
                showError("Please enter your travel request first.");
                return;
            }

            setLoading(true);

            try {
                // Ensure your backend is running to handle this request
                const response = await fetch("/api/travel", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message,
                        thread_id: currentThreadId
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Something went wrong.");
                }

                currentThreadId = data.thread_id;
                localStorage.setItem("travel_thread_id", currentThreadId);

                showResult(data.answer, data.thread_id);

            } catch (error) {
                // For testing visually without a backend, uncomment the below lines:
                /*
                showResult("# Paris Itinerary\n## Day 1\n* Visit Eiffel Tower\n* Eat Croissants\n\n## Day 2\n* Louvre Museum\n* Seine River Cruise", "test-123");
                */
                showError(error.message);
            } finally {
                setLoading(false);
            }
        }

        function copyResult() {
            const resultBox = document.getElementById("resultBox");
            const text = resultBox.innerText;

            if (!text) {
                return;
            }

            navigator.clipboard.writeText(text)
                .then(() => {
                    const copyBtn = document.querySelector(".copy-btn");
                    const oldText = copyBtn.textContent;
                    copyBtn.textContent = "Copied!";
                    setTimeout(() => { copyBtn.textContent = oldText; }, 1400);
                })
                .catch(() => {
                    showError("Could not copy result.");
                });
        }

        /* =========================================================
           PDF DOWNLOAD — CORRECTED
           ========================================================= */
        function downloadPDF() {
            const pdfContent = document.getElementById("pdfContent");

            if (!pdfContent || pdfContent.innerText.trim() === "") {
                showError("No travel plan available.");
                return;
            }

            const downloadBtn = document.querySelector(".download-btn");
            const oldText = downloadBtn.textContent;

            downloadBtn.textContent = "Preparing PDF...";
            downloadBtn.disabled = true;

            const opt = {
                // [Top, Right, Bottom, Left] margins in mm. 
                // This ensures EVERY page gets proper spacing seamlessly.
                margin: [15, 15, 15, 15], 
                filename: "AI_Travel_Plan.pdf",
                
                image: { 
                    type: "jpeg", 
                    quality: 1 
                },
                
                html2canvas: {
                    scale: 2, 
                    useCORS: true,
                    scrollY: 0
                },
                
                jsPDF: { 
                    unit: "mm", 
                    format: "a4", 
                    orientation: "portrait" 
                },
                
                pagebreak: {
                    // 'css' handles explicit avoidance rules, 'legacy' handles paragraph flow
                    mode: ['css', 'legacy'], 
                    avoid: ["h1", "h2", "h3", "h4", "tr", "li", "table", "img"]
                }
            };

            html2pdf()
                .from(pdfContent)
                .set(opt)
                .save()
                .catch((err) => {
                    showError("Could not generate PDF. Please try again.");
                    console.error(err);
                })
                .finally(() => {
                    downloadBtn.textContent = oldText;
                    downloadBtn.disabled = false;
                });
        }

        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "Enter") {
                sendMessage();
            }
        });
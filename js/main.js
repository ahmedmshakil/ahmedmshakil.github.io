/**
 * Main JavaScript for Shakil Ahmed's Portfolio
 * Theme: Software Engineer, Backend/DevOps Engineer
 */

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display user's IP address using ONLY IPinfo free API
    const userIpElement = document.getElementById('user-ip');
    const ipLinkElement = document.getElementById('ip-link');

    let ipInfoData = null;

    function isValidIP(ip) {
        const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:(:([0-9a-fA-F]{1,4})){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}$/;

        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    }

    async function fetchIpInfo() {
        if (!userIpElement) return;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch('https://ipinfo.io/json', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data || !data.ip || !isValidIP(data.ip)) {
                throw new Error('Invalid IPinfo response');
            }

            ipInfoData = data;
            userIpElement.textContent = data.ip;
        } catch (error) {
            console.error('IPinfo fetch failed:', error);
            if (userIpElement) userIpElement.textContent = 'Not detected';
            ipInfoData = null;
        }
    }

    // Clicking IP opens /ipinfo/ page with data stored in localStorage
    if (ipLinkElement) {
        ipLinkElement.addEventListener('click', (e) => {
            e.preventDefault();

            if (!ipInfoData) {
                alert('IP information not loaded yet. Please wait a moment.');
                return;
            }

            // Store IP data in localStorage
            localStorage.setItem('ipinfo_data', JSON.stringify(ipInfoData));
            
            // Open /ipinfo/ in new tab
            window.open('/ipinfo/', '_blank');
        });
    }

    fetchIpInfo();

    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Toggle menu icon animation
            const bars = document.querySelectorAll('.bar');
            if (menuToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                menuToggle.click();
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    // Navbar scroll effect disabled — fixed slim header
    const navbar = document.querySelector('.navbar');

    // Terminal typing effect simulation
    function simulateTyping() {
        const commands = [
            'whoami',
            'cat skills.txt',
            'ls projects/',
            'docker ps',
            'kubectl get pods',
            'terraform apply',
            'git push origin main'
        ];

        const outputs = [
            'Md Shakil Ahmed',
            'AWS | Docker | Kubernetes | Django | FastApi | CI/CD | Python | JavaScript',
            'Legal Consultation System— BLCS',
            'CONTAINER ID   IMAGE                  STATUS          PORTS',
            'NAME                    READY   STATUS    RESTARTS   AGE',
            'Apply complete! Resources: 12 added, 5 changed, 2 destroyed.',
            'Everything up-to-date'
        ];

        let currentIndex = 0;
        const terminalBody = document.querySelector('.terminal-body');

        function updateTerminal() {
            // Clear previous command and output except the first one
            const lines = terminalBody.querySelectorAll('.line');
            if (lines.length > 2) {
                for (let i = 2; i < lines.length; i++) {
                    lines[i].remove();
                }
            }

            // Add new command
            const commandLine = document.createElement('div');
            commandLine.className = 'line';
            commandLine.innerHTML = `<span class="prompt">$</span> <span class="command">${commands[currentIndex]}</span>`;
            terminalBody.appendChild(commandLine);

            // Add output after a short delay
            setTimeout(() => {
                const outputLine = document.createElement('div');
                outputLine.className = 'line';
                outputLine.innerHTML = `<span class="output">${outputs[currentIndex]}</span>`;
                terminalBody.appendChild(outputLine);

                // Add prompt line
                const promptLine = document.createElement('div');
                promptLine.className = 'line';
                promptLine.innerHTML = `<span class="prompt">$</span> <span class="cursor"></span>`;
                terminalBody.appendChild(promptLine);

                // Move to next command
                currentIndex = (currentIndex + 1) % commands.length;
            }, 500);
        }

        // Initial update
        updateTerminal();

        // Update terminal every 3 seconds
        setInterval(updateTerminal, 3000);
    }

    simulateTyping();

    // Skill animation on scroll
    const skillCategories = document.querySelectorAll('.skill-category');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    skillCategories.forEach(category => {
        category.style.opacity = 0;
        category.style.transform = 'translateY(20px)';
        category.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(category);
    });

    // Initialize EmailJS
    emailjs.init("YJZu6V-1TBhEYFccE"); //currently on (Shakil)_Replace with YOUR_PUBLIC_KEY

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const formValues = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Send email using EmailJS
            emailjs.send("service_tq5blnq", "template_8wmpcf9", formValues)
                .then(function (response) {
                    console.log("Email sent successfully!", response);

                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Thank you for your message! I will get back to you soon.';
                    successMessage.style.color = 'var(--terminal-green)';
                    successMessage.style.padding = '15px';
                    successMessage.style.marginTop = '15px';
                    successMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                    successMessage.style.borderRadius = '4px';

                    contactForm.appendChild(successMessage);

                    // Clear the form
                    contactForm.reset();

                    // Remove the message after 5 seconds
                    setTimeout(() => {
                        successMessage.remove();
                    }, 5000);
                })
                .catch(function (error) {
                    console.error("Email sending failed!", error);

                    // Show error message
                    alert("Failed to send message. Please try again later.");
                });
        });
    }
});

/**
 * Main JavaScript for Shakil Ahmed's Portfolio
 * Theme: Software Engineer, Backend/DevOps Engineer
 */

document.addEventListener('DOMContentLoaded', function () {
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
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none';
        }
    });

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

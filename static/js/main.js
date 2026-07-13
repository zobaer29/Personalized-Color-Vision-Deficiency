document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentCvd = 'deuteranopia';
    let currentImage = '';
    let imagesList = [];

    // DOM Elements
    const imageSelect = document.getElementById('image-select');
    const quickGallery = document.getElementById('quick-gallery');
    
    const cvdButtons = document.querySelectorAll('.cvd-btn');
    
    const imgOriginal = document.getElementById('img-original');
    const imgSimulated = document.getElementById('img-simulated');
    const imgCorrected = document.getElementById('img-corrected');
    
    const loaderOriginal = document.getElementById('loader-original');
    const loaderSimulated = document.getElementById('loader-simulated');
    const loaderCorrected = document.getElementById('loader-corrected');

    const simulatedTag = document.getElementById('simulated-tag');
    const correctedTag = document.getElementById('corrected-tag');
    const simulatedDesc = document.getElementById('simulated-desc');
    const correctedDesc = document.getElementById('corrected-desc');

    const infoCards = {
        deuteranopia: document.getElementById('info-deuteranopia'),
        protanopia: document.getElementById('info-protanopia'),
        tritanopia: document.getElementById('info-tritanopia')
    };

    // Descriptions per CVD type
    const cvdMetaData = {
        deuteranopia: {
            name: 'Deuteranopia',
            simDesc: 'Green channel insensitivity. Greens and reds blend into a brownish-yellow hue, reducing contrast.',
            corrDesc: 'Daltonization shifts green details into the red/blue channel space to restore luminance contrast.'
        },
        protanopia: {
            name: 'Protanopia',
            simDesc: 'Red channel insensitivity. Red light is perceived as very dark/grey, and red-green contrast is lost.',
            corrDesc: 'Adjusts red hues to shift their brightness and color coordinates into the yellow/blue visible range.'
        },
        tritanopia: {
            name: 'Tritanopia',
            simDesc: 'Blue channel insensitivity. Blue looks green, and yellow looks pink or violet. Very rare form of CVD.',
            corrDesc: 'Redistributes blue-yellow light signals into the red-green spectrum which remains fully functional.'
        }
    };

    // Load available images from the API
    async function init() {
        try {
            const response = await fetch('/api/images');
            imagesList = await response.json();
            
            if (imagesList.length === 0) {
                imageSelect.innerHTML = '<option disabled>No images found</option>';
                return;
            }

            // Populate select dropdown
            imageSelect.innerHTML = '';
            imagesList.forEach(filename => {
                const option = document.createElement('option');
                option.value = filename;
                option.textContent = getCleanName(filename);
                imageSelect.appendChild(option);
            });

            // Set default image
            currentImage = imagesList[0];
            imageSelect.value = currentImage;

            // Generate popular quick gallery (limit to first 12 popular/interesting items)
            const popularCount = Math.min(12, imagesList.length);
            quickGallery.innerHTML = '';
            for (let i = 0; i < popularCount; i++) {
                const filename = imagesList[i];
                const item = document.createElement('div');
                item.className = `quick-item ${filename === currentImage ? 'active' : ''}`;
                item.dataset.filename = filename;
                item.setAttribute('data-name', getCleanName(filename).split(' ')[0]);

                const img = document.createElement('img');
                img.src = `/images/original/${filename}`;
                img.alt = filename;
                img.loading = 'lazy';

                item.appendChild(img);
                quickGallery.appendChild(item);

                // Quick item selection event
                item.addEventListener('click', () => {
                    document.querySelectorAll('.quick-item').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                    currentImage = filename;
                    imageSelect.value = filename;
                    updateImages();
                });
            }

            // Listen for dropdown select changes
            imageSelect.addEventListener('change', (e) => {
                currentImage = e.target.value;
                
                // Update quick gallery active item
                document.querySelectorAll('.quick-item').forEach(el => {
                    if (el.dataset.filename === currentImage) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                });
                
                updateImages();
            });

            // Set up button selection listeners
            cvdButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    cvdButtons.forEach(b => b.classList.remove('active'));
                    const target = e.currentTarget;
                    target.classList.add('active');
                    currentCvd = target.dataset.cvd;
                    updateImages();
                });
            });

            // Run initial load
            updateImages();

        } catch (error) {
            console.error('Error loading images:', error);
            imageSelect.innerHTML = '<option disabled>Error loading images</option>';
        }
    }

    // Helper to make image filenames readable
    function getCleanName(filename) {
        // Strip extension
        let name = filename.replace(/\.[^/.]+$/, "");
        // Capitalize and replace underscores
        name = name.replace(/_/g, ' ');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Bind Image Loading indicator
    function bindImageLoader(imgElement, loaderElement) {
        imgElement.classList.remove('loaded');
        loaderElement.style.opacity = '1';
        
        // Remove previous listeners if any
        imgElement.onload = null;
        
        imgElement.onload = () => {
            imgElement.classList.add('loaded');
            loaderElement.style.opacity = '0';
        };
    }

    // Update images shown in the grid
    function updateImages() {
        if (!currentImage) return;

        // Show loading animations
        bindImageLoader(imgOriginal, loaderOriginal);
        bindImageLoader(imgSimulated, loaderSimulated);
        bindImageLoader(imgCorrected, loaderCorrected);

        // Trigger resource requests
        imgOriginal.src = `/images/original/${currentImage}`;
        imgSimulated.src = `/images/simulated/${currentCvd}/${currentImage}`;
        imgCorrected.src = `/images/corrected/${currentCvd}/${currentImage}`;

        // Update Text / Tags
        const meta = cvdMetaData[currentCvd];
        simulatedTag.textContent = `${meta.name} Simulation`;
        correctedTag.textContent = `Corrected (${meta.name})`;
        simulatedDesc.textContent = meta.simDesc;
        correctedDesc.textContent = meta.corrDesc;

        // Update Info Highlight cards
        Object.keys(infoCards).forEach(key => {
            if (key === currentCvd) {
                infoCards[key].classList.add('active');
            } else {
                infoCards[key].classList.remove('active');
            }
        });
    }

    // Initialize Web App
    init();
});

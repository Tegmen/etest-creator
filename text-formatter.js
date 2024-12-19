const textFormatter = {
    // Convert markdown to HTML for display
    markdownToHtml(text) {
        if (!text) return '';
        
        return text
            // Handle images first
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="embedded-image">')
            // Handle line breaks
            .replace(/(?:\r\n|\r|\n)/g, '<br>')
            // Bold
            .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
            // Italic
            .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
            // Bullet points
            .replace(/^[\*\-]\s(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    },

    // Convert HTML to markdown for storage
    htmlToMarkdown(html) {
        let text = html
            .replace(/<img.*?src="(.*?)".*?alt="(.*?)".*?>/g, '![$2]($1)')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '_$1_')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<li>(.*?)<\/li>/g, '- $1\n')
            .replace(/<\/?ul>/g, '');
        
        // Clean up extra newlines
        return text.replace(/\n+/g, '\n').trim();
    },

    // Create a rich text editor
    createEditor(container, initialValue = '') {
        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'rich-text-editor';

        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';

        // Create editor buttons
        const buttons = [
            { icon: 'format_bold', command: 'bold', title: 'Fett (Ctrl+B)' },
            { icon: 'format_italic', command: 'italic', title: 'Kursiv (Ctrl+I)' },
            { icon: 'format_list_bulleted', command: 'insertUnorderedList', title: 'Aufzählung' },
            { icon: 'image', command: 'insertImage', title: 'Bild einfügen' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'editor-btn material-icons';
            button.textContent = btn.icon;
            button.title = btn.title;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (btn.command === 'insertImage') {
                    const url = prompt('Bild-URL eingeben:');
                    if (url) {
                        const alt = prompt('Alternativtext eingeben:', '');
                        const imageMarkdown = `![${alt}](${url})`;
                        const selection = window.getSelection();
                        const range = selection.getRangeAt(0);
                        const textNode = document.createTextNode(imageMarkdown);
                        range.insertNode(textNode);
                    }
                } else {
                    document.execCommand(btn.command, false, null);
                }
                updateHiddenInput();
            });
            
            toolbar.appendChild(button);
        });

        // Create editable content area
        const editableDiv = document.createElement('div');
        editableDiv.className = 'editor-content';
        editableDiv.contentEditable = true;
        editableDiv.innerHTML = this.markdownToHtml(initialValue);

        // Create hidden input for form submission
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = container.querySelector('input, textarea')?.name || '';
        hiddenInput.required = container.querySelector('input, textarea')?.required || false;

        // Function to update hidden input with markdown
        const updateHiddenInput = () => {
            hiddenInput.value = this.htmlToMarkdown(editableDiv.innerHTML);
        };

        // Add event listeners
        editableDiv.addEventListener('input', updateHiddenInput);
        editableDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                document.execCommand('insertLineBreak');
                e.preventDefault();
            }
        });

        // Add keyboard shortcuts
        editableDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        document.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        document.execCommand('italic');
                        break;
                }
            }
        });

        // Assemble editor
        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editableDiv);
        editorContainer.appendChild(hiddenInput);

        // Replace original input/textarea with editor
        const originalInput = container.querySelector('input, textarea');
        if (originalInput) {
            container.replaceChild(editorContainer, originalInput);
        } else {
            container.appendChild(editorContainer);
        }

        // Initial update of hidden input
        updateHiddenInput();

        return {
            getValue: () => hiddenInput.value,
            setValue: (value) => {
                editableDiv.innerHTML = this.markdownToHtml(value);
                updateHiddenInput();
            }
        };
    }
};
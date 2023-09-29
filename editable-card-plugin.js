var observableAttributes = [
    // The value of the cell that the plugin is being rendered in
    "cellvalue",
    // The value of the row that the plugin is being rendered in
    "rowvalue",
    // The value of the table that the plugin is being rendered in
    "tablevalue",
    // The schema of the table that the plugin is being rendered in
    "tableschemavalue",
    // The schema of the database that the plugin is being rendered in
    "databaseschemavalue",
    // The configuration object that the user specified when installing the plugin
    "configuration",
    // Additional information about the view such as count, page and offset.
    "metadata"
]

var OuterbaseEvent = {
    // The user has triggered an action to save updates
    onSave: "onSave",
    // The user has triggered an action to configure the plugin
    configurePlugin: "configurePlugin",
}

var OuterbaseColumnEvent = {
    // The user has began editing the selected cell
    onEdit: "onEdit",
    // Stops editing a cells editor popup view and accept the changes
    onStopEdit: "onStopEdit",
    // Stops editing a cells editor popup view and prevent persisting the changes
    onCancelEdit: "onCancelEdit",
    // Updates the cells value with the provided value
    updateCell: "updateCell",
}

var OuterbaseTableEvent = {
    // Updates the value of a row with the provided JSON value
    updateRow: "updateRow",
    // Deletes an entire row with the provided JSON value
    deleteRow: "deleteRow",
    // Creates a new row with the provided JSON value
    createRow: "createRow",
    // Performs an action to get the next page of results, if they exist
    getNextPage: "getNextPage",
    // Performs an action to get the previous page of results, if they exist
    getPreviousPage: "getPreviousPage"
}

/**
 * ******************
 * Custom Definitions
 * ******************
 */
class OuterbasePluginConfig_$PLUGIN_ID {
    // Inputs from Outerbase for us to retain
    tableValue = undefined
    count = 0
    limit = 0
    offset = 0
    page = 0
    pageCount = 0
    theme = "light"

    // Inputs from the configuration screen
    imageKey = undefined
    optionalImagePrefix = undefined
    titleKey = undefined
    descriptionKey = undefined
    subtitleKey = undefined

    // Variables for us to hold state of user actions
    deletedRows = []

    constructor(object) {
        this.imageKey = object?.imageKey
        this.optionalImagePrefix = object?.optionalImagePrefix
        this.titleKey = object?.titleKey
        this.descriptionKey = object?.descriptionKey
        this.subtitleKey = object?.subtitleKey
    }

    toJSON() {
        return {
            "imageKey": this.imageKey,
            "imagePrefix": this.optionalImagePrefix,
            "titleKey": this.titleKey,
            "descriptionKey": this.descriptionKey,
            "subtitleKey": this.subtitleKey
        }
    }
}

var triggerEvent = (fromClass, data) => {
    const event = new CustomEvent("custom-change", {
        detail: data,
        bubbles: true,
        composed: true
    });

    fromClass.dispatchEvent(event);
}

var decodeAttributeByName = (fromClass, name) => {
    const encodedJSON = fromClass.getAttribute(name);
    const decodedJSON = encodedJSON
        ?.replace(/&quot;/g, '"')
        ?.replace(/&#39;/g, "'");
    return decodedJSON ? JSON.parse(decodedJSON) : {};
}


/**
 * **********
 * Table View
 * **********
 */
var templateTable = document.createElement("template")
templateTable.innerHTML = `
<style>
#theme-container {
    height: 100%;
    margin: 0;
    padding: 0;
}
#container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: scroll;
}
.containerDiv {
    display: flex;
    flex-direction: column;
    margin: 0 3rem;
}
#theme-container {
    height: 100%;
}
.card-container {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
}
.headDiv {
    margin: 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.headDiv input {
    padding: 0.5rem;
    width: 23em;
    border-radius: 0.5em;
    border-width: 1px;
    border-color: #c9c7c7;
}
.headDiv input:focus {
    outline: none;
}
button {
    padding: 0.6em;
    border-radius: 0.5em;
    border: 1px solid #c9c7c7;
    cursor: pointer;
    background-color: #f1f1f1;
    font-weight: 600;
}
button:hover {
    background-color: #e0e0e0;
}
select {
    padding: 0.3em;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    width: 4em;
  }

/* Style the options within the select element */
option {
font-size: 16px;
}
span {
    font-weight: 600;
    font-size: 15px;
}
.pagination {
    display: flex;
    gap: 1em;
}
.pagination button {
    display: block;
}
.container-div {
    display: grid;
    place-content: center;
}
.grid-item {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid #c9c7c7;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.image-class{
    object-fit: cover;
    width: 100%;
    height: 12rem;
}
.content{
    display: flex;
    flex-direction: column;
    padding: 1rem;
}
.content .title {
    font-weight: 600;
    font-size: 18px;
    margin: 0;
    padding: 0.2em 0;
}
.content .subtitle {
    font-weight: 500;
    font-size: 16px;
    margin: 0;
    padding: 0.2em 0;
}
.content .description {
    font-size: 15px;
    margin: 0;
    padding: 0.2em 0;
}
    .dark {
        #container {
            background-color: black;
            color: white;
        }
    }

    @media only screen and (max-width: 650px) {
        .card-container {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    @media only screen and (min-width: 768px) {
        .card-container {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    @media only screen and (min-width: 1200px) {
        .card-container {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 20px;
        }
    }

    @media only screen and (min-width: 1400px) {
        .card-container {
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 32px;
        }
    }
</style>

<div id="theme-container">
    <div id="container">
        
    </div>
</div>
`
// Can the above div just be a self closing container: <div />

class OuterbasePluginTable_$PLUGIN_ID extends HTMLElement {
    static get observedAttributes() {
        return observableAttributes
    }

    config = new OuterbasePluginConfig_$PLUGIN_ID({})

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: "open" })
        this.shadow.appendChild(templateTable.content.cloneNode(true))
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.config = new OuterbasePluginConfig_$PLUGIN_ID(decodeAttributeByName(this, "configuration"))
        this.config.tableValue = decodeAttributeByName(this, "tableValue")

        let metadata = decodeAttributeByName(this, "metadata")
        this.config.count = metadata?.count
        this.config.limit = metadata?.limit
        this.config.offset = metadata?.offset
        this.config.theme = metadata?.theme
        this.config.page = metadata?.page
        this.config.pageCount = metadata?.pageCount

        var element = this.shadow.getElementById("theme-container");
        element.classList.remove("dark")
        element.classList.add(this.config.theme);

        this.render()
    }

    filterCards() {
        const input = this.shadowRoot.getElementById("searchInput").value.toLowerCase();
        const cards = this.shadowRoot.querySelectorAll(".grid-item");

        cards.forEach((card) => {
            const cardText = card.textContent.toLowerCase();

            // Check if the card's text contains the search input
            if (cardText.includes(input)) {
                card.style.display = "block"; // Show the card
            } else {
                card.style.display = "none"; // Hide the card
            }
        });
    }


    render() {
        this.shadow.querySelector("#container").innerHTML = `
        <div class="containerDiv">
            <div class="headDiv">
                <button id="configurePluginButton">Configure Plugin</button>
                <div>
                <span>Show</span>
                <select id="entriesPerPage">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
                <span>entries</span>
                </div>
                <div class="pagination">
                <button id="previousPageButton">Prev page</button>
                <button id="nextPageButton">Next page</button>
                </div>
                
                <input type="text" class=searchInput" id="searchInput" placeholder="Search cards...">
            </div>
            <div class="card-container" id="cardContainer">
                ${this.config?.tableValue?.length && this.config?.tableValue?.map((row) => `
                    <div class="grid-item">
                        ${ this.config.imageKey ? `
                            <div class="img-wrapper">
                                <img src="${row[this.config.imageKey]}" class="image-class editable-image" data-image-index="0">
                            </div>
                        ` : `` }
                    
                        <div class="content">
                            ${ this.config.titleKey ? `<div class="editable-content title" data-text-index="0">${row[this.config.titleKey]}</div>` : `` }
                            ${ this.config.subtitleKey ? `<div class="editable-content subtitle" data-text-index="0">${row[this.config.subtitleKey]}</div>` : `` }
                            ${ this.config.descriptionKey ? `<div class="editable-content description" data-text-index="0">${row[this.config.descriptionKey]}</div>` : `` }
                        </div>
                    </div>
            

                `).join("")}
            </div>

            <div style="text-align: center; padding-bottom: 100px; padding-top: 4em;">
                Viewing ${this.config.offset} - ${this.config.limit} of ${this.config.count} results
                <br />
                Page ${this.config.page} of ${this.config.pageCount}
                You're using the <b>${this.config.theme}</b> theme
            </div>
        </div>
        `

        /// Get references to the select element and the card container
        const entriesPerPageSelect = this.shadowRoot.getElementById("entriesPerPage");
        const cardContainer = this.shadowRoot.getElementById("cardContainer");

        // Function to update the number of displayed cards based on the selected value
        function updateDisplayedCards() {
            const selectedValue = parseInt(entriesPerPageSelect.value, 10);

            // Check if a valid option is selected
            if (!isNaN(selectedValue)) {
                const cards = Array.from(cardContainer.querySelectorAll(".grid-item"));

                // Show the first `selectedValue` number of cards and hide the rest
                cards.forEach((card, index) => {
                    if (index < selectedValue) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none";
                    }
                });
            }
        }

        // Attach an event listener to the select element
        entriesPerPageSelect.addEventListener("change", updateDisplayedCards);


        // Add event listeners for double-click on editable elements
        const editableImages = this.shadowRoot.querySelectorAll('.editable-image');
        const editableTexts = this.shadowRoot.querySelectorAll('.editable-content');

        editableImages.forEach((image, index) => {
            image.addEventListener('dblclick', () => {
                handleImageEdit(image, index);
            });
        });

        editableTexts.forEach((text, index) => {
            text.addEventListener('dblclick', () => {
                handleTextEdit(text, index);
            });
        });

        function handleImageEdit(image, index) {
            // Replace the image with an input field
            const imageUrl = image.src;
            const inputField = document.createElement('input');
            inputField.type = 'url';
            inputField.value = imageUrl;

            // Replace the image element with the input field
            const parent = image.parentElement;
            parent.innerHTML = '';
            parent.appendChild(inputField);

            // Focus the input field
            inputField.focus();

            // Add an event listener to handle input changes
            inputField.addEventListener('blur', () => {
                // Update the image with the new URL
                const newImageUrl = inputField.value;
                image.src = newImageUrl;

                // Restore the image element
                parent.innerHTML = '';
                parent.appendChild(image);
            });
        }

        function handleTextEdit(textElement, index) {
            // Replace the text with an input field
            const textValue = textElement.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = textValue;

            // Replace the text element with the input field
            textElement.innerHTML = '';
            textElement.appendChild(inputField);

            // Focus the input field
            inputField.focus();

            // Add an event listener to handle input changes
            inputField.addEventListener('blur', () => {
                // Update the text content with the new value
                const newTextValue = inputField.value;
                textElement.textContent = newTextValue;

                // Restore the text element
                textElement.innerHTML = newTextValue;
            });
        }



        // Attach an event listener to the input field within the Shadow DOM
        const searchInput = this.shadowRoot.getElementById("searchInput");
        searchInput.addEventListener("input", this.filterCards.bind(this)); // Bind the function to the class instance
        
        var configurePluginButton = this.shadow.getElementById("configurePluginButton");
        configurePluginButton.addEventListener("click", () => {
            triggerEvent(this, {
                action: OuterbaseEvent.configurePlugin
            })
        });

        var previousPageButton = this.shadow.getElementById("previousPageButton");
        previousPageButton.addEventListener("click", () => {
            triggerEvent(this, {
                action: OuterbaseTableEvent.getPreviousPage,
                value: {}
            })
        });

        var nextPageButton = this.shadow.getElementById("nextPageButton");
        nextPageButton.addEventListener("click", () => {
            triggerEvent(this, {
                action: OuterbaseTableEvent.getNextPage,
                value: {}
            })
        });
    }
}


/**
 * ******************
 * Configuration View
 * ******************
 */
var templateConfiguration = document.createElement("template")
templateConfiguration.innerHTML = `
<style>
    #configuration-container {
        display: flex;
        height: 100%;
        overflow-y: scroll;
        padding: 40px 50px 65px 40px;
    }

    .field-title {
        font: "Inter", sans-serif;
        font-size: 12px;
        line-height: 18px;
        font-weight: 500;
        margin: 0 0 8px 0;
    }

    select {
        width: 320px;
        height: 40px;
        margin-bottom: 16px;
        background: transparent;
        border: 1px solid #343438;
        border-radius: 8px;
        color: black;
        font-size: 14px;
        padding: 0 8px;
        cursor: pointer;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 -960 960 960" width="32"><path fill="black" d="M480-380 276-584l16-16 188 188 188-188 16 16-204 204Z"/></svg>');
        background-position: 100%;
        background-repeat: no-repeat;
        appearance: none;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
    }

    input {
        width: 320px;
        height: 40px;
        margin-bottom: 16px;
        background: transparent;
        border: 1px solid #343438;
        border-radius: 8px;
        color: black;
        font-size: 14px;
        padding: 0 8px;
        box-sizing: border-box;
    }

    button {
        border: none;
        background-color: #834FF8;
        color: white;
        padding: 6px 18px;
        font: "Inter", sans-serif;
        font-size: 14px;
        line-height: 18px;
        border-radius: 8px;
        cursor: pointer;
    }

    .preview-card {
        margin-left: 80px;
        width: 240px;
        background-color: white;
        border-radius: 16px;
        overflow: hidden;
        border-width: 1px;
        border: 1px solid #c9c7c7;
    }

    .preview-card > img {
        width: 100%;
        height: 165px;
    }

    .preview-card > div {
        padding: 16px;
        display: flex; 
        flex-direction: column;
        color: black;
    }

    .preview-card > div > p {
        margin: 0;
    }

    .dark {
        #configuration-container {
            background-color: black;
            color: white;
        }
    }

    .dark > div > div> input {
        color: white !important;
    }

    .dark > div > div> select {
        color: white !important;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 -960 960 960" width="32"><path fill="white" d="M480-380 276-584l16-16 188 188 188-188 16 16-204 204Z"/></svg>');
    }
</style>

<div id="theme-container">
    <div id="configuration-container">
        
    </div>
</div>
`
// Can the above div just be a self closing container: <div />

class OuterbasePluginConfiguration_$PLUGIN_ID extends HTMLElement {
    static get observedAttributes() {
        return observableAttributes
    }

    config = new OuterbasePluginConfig_$PLUGIN_ID({})

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: "open" })
        this.shadow.appendChild(templateConfiguration.content.cloneNode(true))
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.config = new OuterbasePluginConfig_$PLUGIN_ID(decodeAttributeByName(this, "configuration"))
        this.config.tableValue = decodeAttributeByName(this, "tableValue")
        this.config.theme = decodeAttributeByName(this, "metadata").theme

        var element = this.shadow.getElementById("theme-container");
        element.classList.remove("dark")
        element.classList.add(this.config.theme);

        this.render()
    }

    render() {
        let sample = this.config.tableValue.length ? this.config.tableValue[0] : {}
        let keys = Object.keys(sample)

        if (!keys || keys.length === 0 || !this.shadow.querySelector('#configuration-container')) return

        this.shadow.querySelector('#configuration-container').innerHTML = `
        <div style="flex: 1;">
            <p class="field-title">Image Key</p>
            <select id="imageKeySelect">
                ` + keys.map((key) => `<option value="${key}" ${key === this.config.imageKey ? 'selected' : ''}>${key}</option>`).join("") + `
            </select>

            <p class="field-title">Image URL Prefix (optional)</p>
            <input type="text" value="" />

            <p class="field-title">Title Key</p>
            <select id="titleKeySelect">
                ` + keys.map((key) => `<option value="${key}" ${key === this.config.titleKey ? 'selected' : ''}>${key}</option>`).join("") + `
            </select>

            <p class="field-title">Description Key</p>
            <select id="descriptionKeySelect">
                ` + keys.map((key) => `<option value="${key}" ${key === this.config.descriptionKey ? 'selected' : ''}>${key}</option>`).join("") + `
            </select>

            <p class="field-title">Subtitle Key</p>
            <select id="subtitleKeySelect">
                ` + keys.map((key) => `<option value="${key}" ${key === this.config.subtitleKey ? 'selected' : ''}>${key}</option>`).join("") + `
            </select>

            <div style="margin-top: 8px;">
                <button id="saveButton">Save View</button>
            </div>
        </div>

        <div style="position: relative;">
            <div class="preview-card">
                <img src="${sample[this.config.imageKey]}" width="100" height="100">

                <div>
                    <p style="margin-bottom: 8px; font-weight: bold; font-size: 16px; line-height: 24px; font-family: 'Inter', sans-serif;">${sample[this.config.titleKey]}</p>
                    <p style="margin-bottom: 8px; font-size: 14px; line-height: 21px; font-weight: 400; font-family: 'Inter', sans-serif;">${sample[this.config.descriptionKey]}</p>
                    <p style="margin-top: 12px; font-size: 12px; line-height: 16px; font-family: 'Inter', sans-serif; color: gray; font-weight: 300;">${sample[this.config.subtitleKey]}</p>
                </div>
            </div>
        </div>
        `

        var saveButton = this.shadow.getElementById("saveButton");
        saveButton.addEventListener("click", () => {
            triggerEvent(this, {
                action: OuterbaseEvent.onSave,
                value: this.config.toJSON()
            })
        });

        var imageKeySelect = this.shadow.getElementById("imageKeySelect");
        imageKeySelect.addEventListener("change", () => {
            this.config.imageKey = imageKeySelect.value
            this.render()
        });

        var titleKeySelect = this.shadow.getElementById("titleKeySelect");
        titleKeySelect.addEventListener("change", () => {
            this.config.titleKey = titleKeySelect.value
            this.render()
        });

        var descriptionKeySelect = this.shadow.getElementById("descriptionKeySelect");
        descriptionKeySelect.addEventListener("change", () => {
            this.config.descriptionKey = descriptionKeySelect.value
            this.render()
        });

        var subtitleKeySelect = this.shadow.getElementById("subtitleKeySelect");
        subtitleKeySelect.addEventListener("change", () => {
            this.config.subtitleKey = subtitleKeySelect.value
            this.render()
        });
    }
}

window.customElements.define('outerbase-plugin-table-$PLUGIN_ID', OuterbasePluginTable_$PLUGIN_ID)
window.customElements.define('outerbase-plugin-configuration-$PLUGIN_ID', OuterbasePluginConfiguration_$PLUGIN_ID)
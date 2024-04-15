// INICIAÇÃO DOS VALORES PARA AS OPÇÕES DAS LINGUAS
const src_languages_options = [["AUTO", "(Auto detect the source language)"], ["AR", "Arabic"], ["BG", "Bulgarian"], ["CS", "Czech"], ["DA", "Danish"], ["DE", "German"], ["EL", "Greek"], ["EN", "English"], ["ES", "Spanish"], ["ET", "Estonian"], ["FI", "Finnish"], ["FR", "French"], ["HU", "Hungarian"], ["ID", "Indonesian"], ["IT", "Italian"], ["JA", "Japanese"], ["KO", "Korean"], ["LT", "Lithuanian"], ["LV", "Latvian"], ["NB", "Norwegian (Bokmål)"], ["NL", "Dutch"], ["PL", "Polish"], ["PT", "Portuguese (all Portuguese varieties mixed)"], ["RO", "Romanian"], ["RU", "Russian"], ["SK", "Slovak"], ["SL", "Slovenian"], ["SV", "Swedish"], ["TR", "Turkish"], ["UK", "Ukrainian"], ["ZH", "Chinese"]];
const trg_languages_options = [["AR", "Arabic"], ["BG", "Bulgarian"], ["CS", "Czech"], ["DA", "Danish"], ["DE", "German"], ["EL", "Greek"], ["EN", "English (unspecified variant for backward compatibility)"], ["EN-GB", "English (British)"], ["EN-UN", "English (American)"], ["ES", "Spanish"], ["ET", "Estonian"], ["FI", "Finnish"], ["FR", "French"], ["HU", "Hungarian"], ["ID", "Indonesian"], ["IT", "Italian"], ["JA", "Japanese"], ["KO", "Korean"], ["LT", "Lithuanian"], ["LV", "Latvian"], ["NB", "Norwegian (Bokmål)"], ["NL", "Dutch"], ["PL", "Polish"], ["PT", "Portuguese (unspecified variant for backward compatibility)"], ["PT-BR", "Portuguese (Brazilian)"], ["PT-PT", "Portuguese (all Portuguese varieties excluding Brazilian Portuguese)"], ["RO", "Romanian"], ["RU", "Russian"], ["SK", "Slovak"], ["SL", "Slovenian"], ["SV", "Swedish"], ["TR", "Turkish"], ["UK", "Ukrainian"], ["ZH", "Chinese (simplified)"]];
let src_select_language = "AUTO";
let trg_select_language = "EN-UN";
let lowercase_language = navigator.language;
let preferred_language = lowercase_language.substring(0, 2).toUpperCase(navigator.language);
for (let i = 0; i < src_languages_options.length; i++) {
    if (src_languages_options[i][0] === preferred_language) {
        src_select_language = src_languages_options[i][0];
        break
    }
}

// CRIAÇÃO DE DUAS LISTAS PARA SELEÇÃO DA LINGUA FONTE E LINGUA PARA TRADUÇÃO
const src_languages_dom = tabListCreator(src_languages_options, "src_language_tab", "src", src_select_language);
const trg_languages_dom = tabListCreator(trg_languages_options, "trg_language_tab", "trg", trg_select_language);
fetchDataUsage();


async function fetchDataUsage() {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
    }
    const resposta = await fetch("/fetch-data-usage", options);
    const data = await resposta.json();
    console.log(data);

    const p_char_used = document.getElementById('char_used');
    const p_char_limit = document.getElementById('char_limit');
    p_char_limit.innerText = data.data_limit;
    p_char_used.innerText = data.data_usage;
}

function SaveState() {
    let obj_selected = "";
    let src_language = "";
    let trg_language = "";
    Array.from(document.getElementsByClassName("obj_type")).forEach(element => (element.checked) ? obj_selected = obj_selected + "," + element.value : "");
    src_language = src_select_language;
    for (let element of src_languages_dom) {
        if (element.input.checked) {
            src_language = element.input.attributes.sigla.value;
            break
        }
    }
    trg_language = trg_select_language;
    for (let element of trg_languages_dom) {
        if (element.input.checked) {
            trg_language = element.input.attributes.sigla.value;
            break
        }

    }

    // SENDING THE URL CONFIG TO AUTOCAD TO SAVE AS GLOBAL VARIABLE
    Acad.Editor.executeCommand(`(setq src_language "${src_language}")`);
    Acad.Editor.executeCommand(`(setq trg_language "${trg_language}")`);
    Acad.Editor.executeCommand(`(setq obj_types "${obj_selected.substring(1)}")`);
}

function tabListCreator(language_array, tab_id, type, selected_language){
    const tab_list = document.getElementById(tab_id);
    const dom_array = [];
    let j = 0;
    let a_height_value = null;
    for (let i = 0; i < language_array.length; i++) {
        let element = {
            input: document.createElement("input"),
            label: document.createElement("label")
        }
        // INPUT
        element.input.setAttribute("type", "radio");
        element.input.classList.add("btn-check");
        element.input.setAttribute("name", `btnradio${type}`);
        element.input.id = `btnradio${i}-${type}`;
        element.input.setAttribute("autocomplete", "off");
        element.input.setAttribute("sigla", language_array[i][0]);
        if (language_array[i][0] === selected_language) {
            element.input.checked = true;
            j = i;
        }
        // LABEL
        element.label.classList.add("btn", "btn-outline-primary");
        element.label.setAttribute("for", element.input.id)
        element.label.innerText = language_array[i][1];
        dom_array[i] = element;
    }

    dom_array.forEach(element => tab_list.append(element.input, element.label));
    if (a_height_value === null) {
        a_height_value = dom_array[0].label.clientHeight;
        document.documentElement.style.setProperty('--a_item_height', `${a_height_value}px`);
    }

    // Calculate the scroll position to make the checked radio button appear in the middle
    tab_list.scrollTop = (tab_list.scrollHeight * (j / dom_array.length)) - (2 * a_height_value);

    return dom_array;
}


const data_querry = "dados";
const fullUrlWithQuery = window.location.origin + "/" + window.location.search;
const urlParams = new URLSearchParams(window.location.search);
const arrayString = urlParams.get(data_querry);
const url = `${window.location.origin}/?${data_querry}=${arrayString}`;
let data_array = arrayString.split(',');
data_array.pop();
data_array.forEach(element => {
    if (element.length > 1) {
        let element_splited = element.split(";");
        element = element_splited;
    }
});
console.log(data_array);

// text_array
const data_text = [];
for (let i = 0; i < data_array.length; i = i + 2) {
    data_text[i/2] = {
        id: data_array[i],
        text_array: data_array[i+1]
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

data_text.forEach((element, index) => data_text[index].text_array = element.text_array.split(';'));
data_text.forEach(element => {
    for (let i = 0; i < element.text_array.length; i++) {
        element.text_array[i] = element.text_array[i]
    }
});
// console.log(JSON.parse(JSON.stringify(data_text)));

// ----REGEX----
// PALAVRAS QUE COMEÇAM COM "\" "." "{"
let regex = /^[\\.\\{]/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i]);
        (match) ? data_text[j].text_array.splice(i, 1) : "";
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

//Redução da string tirando ("/" + texto subsequente)
regex = /\\(?!U)/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let str = data_text[j].text_array[i];
        let match = str.search(regex);
        (match !== -1) ? data_text[j].text_array[i] = data_text[j].text_array[i].slice(0, match) : "";
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

// PALAVRAS VALIDAS PARA TRADUÇÃO
regex = /[\p{L}\s]*[\p{L}]{2,}[\p{L}\s]*/u;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i]);
        (!match) ? data_text[j].text_array.splice(i, 1) : null;
    }
}

// FILTRAR ARRAYS SEM TEXTO
for (let i = data_text.length - 1; i >= 0; i--) {
    (data_text[i].text_array.length === 0) ? data_text.splice(i, 1) : null;
}
// console.log(JSON.parse(JSON.stringify(data_text)));


const api_array = [];
for (let i = 0; i < data_text.length; i++) {
    let sub_array = [];
    for (let j = 0; j < data_text[i].text_array.length; j++) {
        sub_array.push(data_text[i].text_array[j]);
    }
    api_array.push(sub_array);
}

const api_flatten = api_array.flat();
// console.log(api_flatten);

getData(api_flatten, data_text);

async function getData(dado, array) {

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dado)
    }
    const resposta = await fetch("/api", options);
    const json = await resposta.json()
    // console.log(json);
    let accumulator = 0;
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].text_array.length; j++) {
            array[i].text_array[j] = json.texto[accumulator];
            accumulator++;
        }
    }

    // console.log({data_original: data_array, data_trans: array, api_flat: api_flatten});
    accumulator = 0;
    for (let i = 0; i < array.length; i++) {
        let temp_string = data_array[1+(2*i)];
        for (let j = 0; j < array[i].text_array.length; j++) {
            temp_string = temp_string.replace(api_flatten[accumulator], array[i].text_array[j].text);
            accumulator++;
        }
        data_array[1+(2*i)] = temp_string;
    }
    console.log(data_array);
}

function closeBrowser(reference, _url) {
    window.URL.revokeObjectURL(reference);
    Acad.Editor.executeCommand("regen");
    Acad.Editor.executeCommand("._trdztxt");
}

function decodeHtmlEntities(html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}



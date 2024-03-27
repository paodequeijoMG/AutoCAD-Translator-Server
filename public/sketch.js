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

getData(api_flatten, data_text, data_array);


async function getData(dado, array_sub, array_complete) {

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dado)
    }
    const resposta = await fetch("/api", options);
    const json = await resposta.json()

    //CRIAÇÃO DE UMA ARRAY DA MESMA ESTRUTURA DA QUAL FOI CRIADA NA ROTINA LISP
    const response_text_array = [];
    let accumulator = 0;
    console.log({json: json, array_sub: array_sub, array_complete: array_complete});

    for (let i = 0; i < array_sub.length; i++) {
        response_text_array.push(array_sub[i].id);
        let temp_string = array_complete[(i*2)+1];
        for (let j = 0; j < array_sub[i].text_array.length; j++) {
            if (json.texto[accumulator].text !== array_sub[i].text_array[j]) {
                temp_string = temp_string.replace(array_sub[i].text_array[j] ,json.texto[accumulator].text)
            }
            accumulator++;
        }
        response_text_array.push(temp_string);
    }
    console.log({response_text_array: response_text_array});

    //String de resposta com texto traduzido
    let lsp_string = response_text_array.join("???").concat("???");
    lsp_string = lsp_string.replaceAll(",", "<v>");
    lsp_string = lsp_string.replaceAll("???", ",");
    lsp_string = lsp_string.replaceAll("<v><v>", "<v>");
    let lsp_strings_array = [];
    let str_end;
    const string_chunks_size = 200;
    for (let i = 0; i < lsp_string.length; i = i + string_chunks_size) {
        (i + string_chunks_size < lsp_string.length) ? (str_end = i + string_chunks_size) : (str_end = lsp_string.length);
        let sub_string = lsp_string.substring(i, str_end);
        lsp_strings_array.push(sub_string);
    }
    console.log(lsp_string);
    console.log(lsp_strings_array);
    closeBrowser(lsp_strings_array);
}

function closeBrowser(lsp_string) {
    lsp_string.forEach(element => Acad.Editor.executeCommand(`(setq api_string_response (strcat api_string_response "${element}"))`));
    Acad.Editor.executeCommand(`(setvar "USERI1" 1)`);
    Acad.Editor.executeCommand("trdztxt");
}



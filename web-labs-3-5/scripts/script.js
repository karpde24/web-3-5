const watchlist = [
  new Crypto(
    "Ethereum",
    "ETH",
    "L1 Blockchain",
    120,
    150,
    10,
    120.5
  ),
  new Crypto(
    "The Sandbox",
    "SAND",
    "GameFi",
    2390000000,
    0,2486,
    7,
    594000000
  ),
  new Crypto(
    "Arbitrum",
    "ARB",
    "for window",
    99,
    120,
    30,
    120
  ),
  new Crypto(
    "Uniswap",
    "UNI",
    "DeFi",
    200,
    300,
    20,
    80
  ),
];
const form_ids_list = {
  name: "String",
  ticker: "String",
  domain: "String",
  circulating_supply: "Number",
  price: "Number",
  ath: "Number",
  mcap: "Number",
};

const nav_buttons = {
  list: document.getElementById("list-button"),
  add: document.getElementById("add-button"),
  edit: document.getElementById("edit-button"),
};

nav_buttons["list"].onclick = () => toggle_nav_page("list");
nav_buttons["add"].onclick = () => toggle_nav_page("add");
document.getElementById("modal_close").onclick = hideModal;
document.getElementById("search_button").onclick = search;
document.getElementById("reset_button").onclick = resetSearch;
document.getElementById("count_mcap_button").onclick = countUpMcap;

window.onload = () =>updateList(watchlist);

const mcap_text = document.getElementById("mcap-text");
const sort_switch = document.getElementById("switch");
sort_switch.onclick = switch_sort_crypto;

const search_group = document.getElementById("search-group");
const search_input = search_group.querySelector("#search_input");
const form_page = document.getElementById("form-page");
const list_page = document.getElementById("list-page");
const grid = list_page.querySelector("#grid");

const form_elements = {
  name: form_page.querySelector("#form__name"),
  ticker: form_page.querySelector("#form__ticker"),
  domain: form_page.querySelector("#form__domain"),
  circulating_supply: form_page.querySelector("#form__circulating_supply"),
  price: form_page.querySelector("#form__price"),
  ath: form_page.querySelector("#form__ath"),
  mcap: form_page.querySelector("#form__mcap"),
  headline: form_page.querySelector("#form__headline"),
  submit: form_page.querySelector("#form__submit"),
  error_modal: form_page.querySelector("#modal_error"),
  error_modal_text: form_page.querySelector("#modal_error_text"),
};
let current = "list";

function input__error(set, elem) {
  if (set) {
    elem.classList.add("form__input--error");
  } else {
    elem.classList.remove("form__input--error");
  }
}

// @return Crypto - generated from the form
function readFormForCrypto() {
  let willCreate = true;
  const values = [];

  let window = document.getElementById("form__crypto");
  for (const [key, value] of Object.entries(form_ids_list)) {
    let elem = form_elements[key];
    let val = elem.value.trim();
    if (val.price === 0) {
      input__error(true, elem);
      willCreate = false;
      showModal("Must be filled: " + key);
      break;
    } else if (value === "Number") {
      val = Number(val);
      if (isNaN(val)) {
        input__error(true, elem);
        willCreate = false;
        showModal("There must be a number: " + key);
        break;
      } else {
        input__error(false, elem);
        values.push(val);
      }
    } else {
      input__error(false, elem);
      values.push(val);
    }
  }

  if (willCreate) {
    hideModal();
    let decor = new Crypto(...values);
    console.log(decor);
    return decor;
  } else {
    console.log("not created");
    return null;
  }
}

function showModal(text) {
  form_elements["error_modal_text"].innerHTML = text;
  form_elements["error_modal"].classList.remove("no-display");
}

function hideModal() {
  form_elements["error_modal"].classList.add("no-display");
}

function updateList(crypto_list = watchlist) {
  let cardTemplate = document.querySelector("#template").children[0];
  console.log(cardTemplate.price);
  const targetChildren = [];
  crypto_list.map((crypto, index) => {
    let newNode = cardTemplate.cloneNode(true);
    for (const [id, value] of Object.entries(crypto)) {
      newNode.querySelector("#card__" + id).innerHTML = value;
    }
    //Edit button
    newNode.querySelector("#card__edit").onclick = () =>
      toggle_nav_page("edit", index);
    //Delete button
    newNode.querySelector("#card__remove").onclick = on_remove;

    targetChildren.push(newNode);
  });
  grid.replaceChildren(...targetChildren);
}

//
// @param type - String. Could be `add` or `edit`
// @param id - Number. Integer, position of the crypto in the list. Only if edit
function prepare_form(type, id = null) {
  if (type === "add") {
    form_elements["headline"].innerHTML = "Add Crypto";
    form_elements["submit"].onclick = on_submit_add;
    for (const id_form of Object.keys(form_ids_list)) {
      form_elements[id_form].value = "";
    }
  } else {
    form_elements["headline"].innerHTML = "Edit crypto";
    let crypto = watchlist[id];
    for (const [id_form, value] of Object.entries(crypto)) {
      form_elements[id_form].value = value;
    }
    form_elements["submit"].onclick = () => on_submit_edit(id);
  }
}

function on_submit_edit(id) {
  let crypto = readFormForCrypto();
  if (crypto != null) {
    watchlist[id] = crypto;
    toggle_nav_page("list");
  }
}

function on_submit_add() {
  let crypto = readFormForCrypto();
  if (crypto != null) {
    watchlist.push(crypto);
    toggle_nav_page("list");
  }
}

function on_remove(id) {
  watchlist.splice(id, 1);
  updateList();
}

function toggle_nav_page(target, id = null) {
  nav_buttons[current].classList.remove("nav__button--active");
  if (current == "edit") {
    nav_buttons["edit"].classList.add("no-display");
  }

  if (current == "list") {
    [search_group, list_page].forEach((val) => val.classList.add("no-display"));
  } else {
    form_page.classList.add("no-display");
  }

  nav_buttons[target].classList.add("nav__button--active");
  if (target == "edit") {
    nav_buttons["edit"].classList.remove("no-display");
  }

  if (target == "list") {
    updateList(watchlist);
    [search_group, list_page].forEach((val) =>
      val.classList.remove("no-display")
    );
  } else {
    prepare_form(target, id);
    form_page.classList.remove("no-display");
  }

  current = target;
}

function search() {
  let search_text = search_input.value.trim();
  if (search_text.price != 0) {
    let filtered_crypto_list = watchlist.filter((value) =>
      value.name.toLowerCase().includes(search_text.toLowerCase())
    );
    updateList(filtered_crypto_list);
  } else {
    resetSearch();
  }
}

function resetSearch() {
  updateList();
}

function switch_sort_crypto() {
  let by_mcap = sort_switch.checked;
  if (by_mcap) {
    watchlist.sort((a, b) => a.mcap - b.mcap);
  } else {
    watchlist.sort((a, b) => a.name.localeCompare(b.name));
  }
  updateList();
}

function countUpMcap() {
  let mcap = watchlist.reduce((a, val) => a+val.mcap, 0);
  mcap_text.innerHTML = '$ ' + mcap.toFixed(2);
}

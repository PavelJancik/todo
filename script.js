function init() {
    $('#copy_info_wrap').hide();
    for (const [key, value] of Object.entries(localStorage)) {
        load_item_from_localStorage(key);
    }
    sort_items();
    $('#trash_bin').animate({ width: 'toggle' }, 0);
    $('#trash_bin > *').animate({ opacity: '0' }, 300);
    $('#empty_trash_icon').toggle(0);
}

// Copy info interaction
function show_info_clicked(show_btn) {
    $('#copy_info_wrap').slideToggle(500);
    $(show_btn).text($(show_btn).text() == 'Show Info' ? 'Hide Info' : 'Show Info')
}

// Item buttons
async function button_clicked(status, item) {
    $(item).attr('data-status', status);
    $(item).find('.toggle_item_preview').css('display', 'none');
    await $(item).slideToggle(500, function () { 
        $(item).prependTo(`#${status}`).slideToggle(500).css('height', 'auto');
        $(item).find('button').attr('disabled', false);
        $(item).find(`.${status}_button`).attr('disabled', true);
        $(item).find('.toggle_item_preview').css('display', 'block')
    }).promise();
    save_item_change(item);
}
function todo_clicked(item) {
    button_clicked('todo', item);
}
function progress_clicked(item) {
    button_clicked('progress', item);
}
function done_clicked(item) {
    button_clicked('done', item);
}
function delete_clicked(item) {
    button_clicked('trash_bin', item)
}

// Items
function create_new_item() {
    let item_id = `item_${new Date().valueOf()}`;
    let item =
        `<div id="${item_id}" class="item testing_item" data-status="todo" data-changed="${new Date().valueOf()}" data-preview='false'>
            <div class='delete_item' onclick="delete_clicked($(this).closest('.item'))">×</div>
            <h2 contenteditable="true" onfocusout="save_item_change($(this).closest('.item'))"></h2>
            <div class='highlight_item' onclick="toggle_important($(this).closest('.item'))">☀︎</div>
            <div class='content_wrap'>
                <p contenteditable="true" onfocusout="save_item_change($(this).closest('.item'))"></p>
                <div class="status_container">
                    <button class='todo_button' onclick="todo_clicked($(this).closest('.item'))" disabled="true">TODO</button>
                    <button class='progress_button' onclick="progress_clicked($(this).closest('.item'))">In Progress</button>
                    <button class='done_button' onclick="done_clicked($(this).closest('.item'))">Done</button>
                </div>
            </div>
            <div class='toggle_item_preview' onclick="toggle_item_preview($(this).closest('.item'))"><div>
        </div>`
    $(item).hide().prependTo("#todo").slideToggle(500);
    save_item_change($(item));
    $('[contenteditable]').blur(function(e) { // removes formating
        $(this).prop('innerText', $(this).prop("innerText"));
    });
}
function save_item_change(item, update_data_changed = true) {
    if (update_data_changed) $(item).attr('data-changed', new Date().valueOf());
    localStorage.setItem($(item).attr('id'), JSON.stringify($(item).wrap('<div/>').parent().html()));
}
function load_item_from_localStorage(item_id) {
    let item_html = JSON.parse(localStorage.getItem(item_id));
    let status = $($.parseHTML(item_html)).attr('data-status');
    $(`#${status}`).append(item_html);
    if ($(`#${item_id}`).attr('data-preview') == 'true') shorten_item($(`#${item_id}`));
}
function sort_items() {
    $('.container').each(function () {
        $(this).find('.item').toArray().sort(function (x, y) {
            return parseInt(x.getAttribute('data-changed')) - parseInt(y.getAttribute('data-changed'));
        }).forEach(item => { $(this).prepend($(item)) })
    })
}
function toggle_important(item) {
    $(item).toggleClass('important');
    save_item_change(item);
}

// Trash Bin
async function toggle_trash() {
    $('#empty_trash_icon').toggle(0);
    if ($('#trash_bin').is(':hidden')) {
        await $('#trash_bin').animate({ width: 'toggle' }, 300).promise();
        $('#trash_bin > *').animate({ opacity: '1' }, 300);
    } else {
        await $('#trash_bin > *').animate({ opacity: '0' }, 300).promise();
        $('#trash_bin').animate({ width: 'toggle' }, 300);
    }
}
function empty_trash_bin() {
    if (confirm(`Warning: ${$('#trash_bin .item').length} items from Trash Bin will be deleted! Continue?`)) {
        $('#trash_bin .item').each(function (i, item) {
            localStorage.removeItem($(item).attr('id'));
            $(item).remove();
        })
    } else console.log('empty trash process canceled')
}

// Preview mode
let preview_mode = false;
function toggle_preview_mode() {
    preview_mode = !preview_mode;
    if (preview_mode) $('.item').each(function () { shorten_item($(this)) });
    else $('.item').each(function () { extend_item($(this)) });
}
function extend_item(item) {
    $(item).find('.content_wrap').slideDown(300, function(){
        $(item).attr('data-preview', 'false');
        save_item_change(item, false);
    });
}
function shorten_item(item) {
    $(item).find('.content_wrap').slideUp(300, function(){
        $(item).attr('data-preview', 'true');
        save_item_change(item, false);
    });
}
function toggle_item_preview(item) {
    if ($(item).attr('data-preview') == 'true') extend_item(item);
    else shorten_item(item);
}
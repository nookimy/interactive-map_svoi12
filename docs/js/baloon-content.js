jQuery(document).ready(function ($) {
    // Статусы
    const STATUS_FREE = 'Свободный участок';
    const STATUS_HOUSE_READY = 'Участок с готовым домом';
    const STATUS_HOUSE_BUILDING = 'Участок со строящимся домом';
    const STATUS_RESERVED = 'Забронированный участок';
    const STATUS_SOLD = 'Проданный участок';

    const statusColors = {
        [STATUS_FREE]: '#ABDE36',
        [STATUS_HOUSE_READY]: '#ABDE36',
        [STATUS_HOUSE_BUILDING]: '#ABDE36',
        [STATUS_RESERVED]: '#DEB736',
        [STATUS_SOLD]: '#b2b2b280',
    };

    // Значения по умолчанию 
    const DEFAULT_AREA_PRICE = 3; // цена за сотку участка, если не указана стоимость участка, но указана площадь участка
    const DEFAULT_HOUSE_PRICE = 2; // цена за кв. метр дома, если не указана стоимость дома, но указана площадь дома


    // Основные данные по участкам
    const locationData = {
        '179': { status: STATUS_RESERVED, name: '179', area: 7.53, price: '1' },
        '180': { status: STATUS_HOUSE_READY, name: '180', price: '99999999', area: 9.45, houseArea: 140, housePrice: 22000000, 'house-link': 'https://svoi12.ru/p/scandisplus/', image: '63185576.jpg' },
        '181': { status: STATUS_HOUSE_BUILDING, name: '181', area: 9.45, price: '99999999', houseArea: 140, housePrice: 22000000 },
        '182': { status: STATUS_SOLD, name: '182', area: 10.2, price: '99999999', houseArea: 180, housePrice: 27000000 },
        '183': { status: STATUS_FREE, name: '183', area: 6.8,},
    };

    // Функция окраски
    function setStatusColor(element, status) {
    if (!statusColors[status]) return;

    const id = $(element).attr('id');
    const $pin = $('#pin-' + id);

    // Меняем цвет pin, если есть
    if ($pin.length) {
        $pin.find('rect').css('fill', statusColors[status]);
    }

    // Меняем fill и stroke для самого участка
    $(element).attr('fill', statusColors[status]);
    $(element).attr('stroke', statusColors[status]);
}

    // Инициализация участков
    Object.keys(locationData).forEach(function (id) {
        const $elem = $('#' + id);
        if (!$elem.length) return;

        const data = locationData[id];
        const attrs = {};

        // Добавляем только реально указанные значения
        if (data.name) attrs['data-locationname'] = data.name;
        if (data.area !== undefined && data.area !== null) attrs['data-locationarea'] = data.area;
        if (data.price !== undefined && data.price !== null) attrs['data-locationprice'] = data.price;
        if (data.houseArea !== undefined && data.houseArea !== null) attrs['data-housearea'] = data.houseArea;
        if (data.housePrice !== undefined && data.housePrice !== null) attrs['data-houseprice'] = data.housePrice;

        $elem.attr(attrs);

        const status = data.status || STATUS_FREE;
        setStatusColor($elem, status);

        // Получаем pin соответствующего участка
        const $pin = $('#pin-' + id);

        // Сбрасываем прозрачность и задаём плавный переход
        $elem.css({
            'cursor': 'pointer',
            'opacity': '0',
            'transition': 'opacity 0.3s ease'
        });
        $pin.css({
            'opacity': '1',          // pin виден по умолчанию
            'transition': 'opacity 0.3s ease'
        });

        // hover на элемент участка
        $elem.hover(
            function () {
                $(this).css('opacity', '0.33'); // подсветка области
                $pin.css('opacity', '0');       // pin становится прозрачным
            },
            function () {
                $(this).css('opacity', '0');    // убираем подсветку области
                $pin.css('opacity', '1');       // pin возвращается
            }
        );
    });

    // Показ/скрытие balloon
    function showBalloon() {
        $('#balloon').addClass('balloon--active');
        $('#balloon-overlay').addClass('active');
    }

    function hideBalloon() {
        $('#balloon').removeClass('balloon--active');
        $('#balloon-overlay').removeClass('active');
    }

    $('#balloon-overlay').on('click', hideBalloon);



// Клик по участку
$('#map').on('click', 'path', function () {
    const id = $(this).attr('id');
    if (!id || !locationData[id]) return;

    const data = locationData[id];
    const name = data.name || '';

    const area = (data.area !== undefined && data.area !== null)
        ? Number(data.area).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' соток'
        : null;

    const rawPrice = data.price ?? null;
    const houseAreaRaw = data.houseArea ?? null;
    const housePriceRaw = data.housePrice ?? null;
    const status = data.status || STATUS_FREE;

    const image = data.image ? `./img/${data.image}` : './img/default.jpg';

    const houseArea = houseAreaRaw !== null ? houseAreaRaw.toLocaleString('ru-RU') + ' м²' : '';

    let housePrice = '';

    if (housePriceRaw !== null && housePriceRaw !== undefined) {
        housePrice = Number(housePriceRaw).toLocaleString('ru-RU') + ' ₽';
    } else if (houseAreaRaw !== null && houseAreaRaw !== undefined) {
        housePrice = (Number(houseAreaRaw) * DEFAULT_HOUSE_PRICE).toLocaleString('ru-RU') + ' ₽';
    }

    // стоимость участка
    let locationPrice = '';
    let locationPriceValue = null;

    if (rawPrice !== null) {
        locationPriceValue = Number(rawPrice);
    } else if (data.area !== undefined && data.area !== null) {
        locationPriceValue = Number(data.area) * DEFAULT_AREA_PRICE;
    }

    if (locationPriceValue !== null) {
        locationPrice = locationPriceValue.toLocaleString('ru-RU') + ' ₽';
    }

    // стоимость дома
    let housePriceValue = null;

    if (housePriceRaw !== null) {
        housePriceValue = Number(housePriceRaw);
    } else if (houseAreaRaw !== null) {
        housePriceValue = Number(houseAreaRaw) * DEFAULT_HOUSE_PRICE;
    }

    // общая стоимость
    let totalPriceValue = null;

    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        totalPriceValue = Number(data.totalPrice);
    } else if (locationPriceValue !== null || housePriceValue !== null) {
        totalPriceValue = (locationPriceValue || 0) + (housePriceValue || 0);
    }

    const totalPrice = totalPriceValue !== null
        ? totalPriceValue.toLocaleString('ru-RU') + ' ₽'
        : '';

    function updateField(selector, value, containerSelector = null) {
        const $el = $(selector);
        const $container = containerSelector ? $(containerSelector) : $el;

        if (value) {
            $el.text(value);
            $container.show();
        } else {
            $container.hide();
        }
    }

    updateField("#location-number", name);
    updateField("#location-status", status);
    updateField("#location-area", area, ".line:has(#location-area)");
    updateField("#house-area", houseArea, ".line:has(#house-area)");
    updateField("#house-price", housePrice, ".line:has(#house-price)");
    updateField("#location-price", locationPrice, ".line--location-price");
    updateField("#total-price", totalPrice, ".line--total-price");

    const statusColors = {
        [STATUS_FREE]: '#ABDE36',
        [STATUS_HOUSE_READY]: '#ABDE36',
        [STATUS_HOUSE_BUILDING]: '#ABDE36',
        [STATUS_RESERVED]: '#DEB736',
        [STATUS_SOLD]: '#b2b2b280',
    };

    $("#location-number").css('background-color', statusColors[status] || '#FFFFFF');

    $('.house__img').attr('src', image).show();

    if (houseAreaRaw !== null || housePriceRaw !== null) {
        $(".house__description").show();
    } else {
        $(".house__description").hide();
    }

    // Обработка кнопки "Подробнее о доме"
    if (data['house-link']) {
        $("#house-btn").attr("href", data['house-link']).show();
    } else {
        $("#house-btn").hide();
    }

    if (status === STATUS_SOLD) {

    $(".line--location-price").hide();
    $(".line--total-price").hide();
    $(".house").hide();

    $("#contact-btn").text("Подобрать похожий");

    } else if (status === STATUS_FREE) {

        $(".line--total-price").addClass("visually-hidden");
        $(".house").hide();

        $("#contact-btn").text("Записаться на просмотр");

    } else {

        $(".house").show();
        $(".line--total-price").removeClass("visually-hidden");

        $("#contact-btn").text("Записаться на просмотр");

    }

    setStatusColor($(this), status);
    showBalloon();
});


    // Клик вне участков — скрытие balloon
    $('#svg').on('click', function (e) {
        const id = e.target.id;
        if (!id || !(id in locationData)) {
            hideBalloon();
        }
    });

    // Кнопка закрытия
    $('.balloon__close-button').on('click', function (event) {
        event.preventDefault();
        hideBalloon();
    });
});
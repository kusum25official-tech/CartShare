/* =====================================================
   CARTSHARE - JAVASCRIPT
   ===================================================== */


/* ================= GLOBAL VARIABLES ================= */

let currentUser = "";
let currentRoom = "";

let roomData = {
    items: [],
    activity: []
};


/* ================= STORAGE KEY ================= */

function getStorageKey() {
    return "cartshare_room_" + currentRoom;
}


/* ================= GENERATE ROOM CODE ================= */

function generateRoomCode() {

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        const randomIndex =
            Math.floor(Math.random() * characters.length);

        code += characters[randomIndex];
    }

    return code;
}


/* ================= SHOW ROOM SECTION ================= */

function showRoomSection() {

    const roomSection =
        document.getElementById("room-section");

    if (roomSection) {

        roomSection.classList.remove("d-none");

        roomSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* ================= CREATE ROOM ================= */

function createRoom() {

    const userName =
        document.getElementById("userName").value.trim();

    if (userName === "") {

        showRoomMessage(
            "Please enter your name first.",
            "danger"
        );

        return;
    }


    currentUser = userName;

    currentRoom = generateRoomCode();


    roomData = {
        items: [],
        activity: []
    };


    saveRoomData();

    addActivity(
        currentUser,
        "created the room"
    );


    saveRoomData();

    const messageBox = document.getElementById("room-message");

    if (messageBox) {
    messageBox.className = "";
    messageBox.textContent = "";
    messageBox.style.display = "none";
}

    showDashboard();
    setupRoomChannel();

    alert(
        "Room created successfully!\n\nRoom Code: "
        + currentRoom
    );

}

/* ================= JOIN ROOM ================= */

function joinRoom() {

    const userName =
        document.getElementById("userName").value.trim();

    const roomCode =
        document.getElementById("roomCode").value
        .trim()
        .toUpperCase();


    if (userName === "") {

        showRoomMessage(
            "Please enter your name first.",
            "danger"
        );

        return;
    }

    if (roomCode === "") {

        showRoomMessage(
            "Please enter a room code.",
            "danger"
        );

        return;
    }

    currentUser = userName;
currentRoom = roomCode;

// Check whether the room actually exists
const savedData = localStorage.getItem(getStorageKey());

if (!savedData) {
    showRoomMessage(
        "Room not found. Please enter a valid room code.",
        "danger"
    );

    currentUser = "";
    currentRoom = "";

    return;
}

try {
    roomData = JSON.parse(savedData);
} catch (error) {
    showRoomMessage(
        "Unable to load this room. Please try again.",
        "danger"
    );

    currentUser = "";
    currentRoom = "";

    return;
}

    addActivity(
        currentUser,
        "joined the room"
    );


    saveRoomData();


    showDashboard();
    setupRoomChannel();

    alert(
        "Joined room successfully!\n\nRoom Code: "
        + currentRoom
    );

}


/* ================= SHOW DASHBOARD ================= */

function showDashboard() {

    const roomSection =
        document.getElementById("room-section");

    const dashboard =
        document.getElementById("dashboard");


    if (roomSection) {
        roomSection.classList.add("d-none");
    }


    if (dashboard) {

        dashboard.classList.remove("d-none");

        dashboard.scrollIntoView({
            behavior: "smooth"
        });

    }


    document.getElementById(
        "currentRoom"
    ).textContent = currentRoom;


    document.getElementById(
        "currentUser"
    ).textContent = currentUser;


    renderCart();

    renderActivity();

}


/* ================= SAVE ROOM DATA ================= */

function saveRoomData() {

    if (currentRoom === "") {
        return;
    }


    localStorage.setItem(
        getStorageKey(),
        JSON.stringify(roomData)
    );


    /* Broadcast changes to other tabs */

    if (typeof BroadcastChannel !== "undefined") {

        sendRoomUpdate();

    }

}


/* ================= BROADCAST CHANNEL ================= */

let roomChannel = null;


function setupRoomChannel() {

    if (typeof BroadcastChannel === "undefined") {
        return;
    }


    if (roomChannel) {

        roomChannel.close();

    }


    roomChannel =
        new BroadcastChannel(
            "cartshare_channel_" + currentRoom
        );


    roomChannel.onmessage = function (event) {

        if (event.data === "room-updated") {

            loadRoomData();

        }

    };

}


/* ================= SEND ROOM UPDATE ================= */

function sendRoomUpdate() {

    if (!roomChannel) {
        return;
    }


    roomChannel.postMessage(
        "room-updated"
    );

}


/* ================= LOAD ROOM DATA ================= */

function loadRoomData() {

    if (currentRoom === "") {
        return;
    }


    const savedData =
        localStorage.getItem(getStorageKey());


    if (!savedData) {
        return;
    }


    try {

        roomData = JSON.parse(savedData);

        renderCart();

        renderActivity();

    } catch (error) {

        console.log(
            "Unable to load room data."
        );

    }

}


/* ================= ADD ITEM ================= */

function addItem() {

    const itemName =
        document.getElementById("itemName")
        .value.trim();

    const quantity =
        parseInt(
            document.getElementById("itemQuantity")
            .value
        );

    const price =
        parseFloat(
            document.getElementById("itemPrice")
            .value
        );


    if (itemName === "") {

        alert("Please enter an item name.");

        return;
    }


    if (!quantity || quantity < 1) {

        alert("Please enter a valid quantity.");

        return;
    }


    if (isNaN(price) || price < 0) {

        alert("Please enter a valid price.");

        return;
    }


    const newItem = {

        id: Date.now(),

        name: itemName,

        quantity: quantity,

        price: price,

        addedBy: currentUser

    };


    roomData.items.push(newItem);


    addActivity(
        currentUser,
        "added " +
        quantity +
        " × " +
        itemName
    );


    saveRoomData();


    renderCart();

    renderActivity();


    /* Clear inputs */

    document.getElementById(
        "itemName"
    ).value = "";

    document.getElementById(
        "itemQuantity"
    ).value = "1";

    document.getElementById(
        "itemPrice"
    ).value = "";

}


/* ================= REMOVE ITEM ================= */

function removeItem(itemId) {

    const itemIndex =
        roomData.items.findIndex(
            function (item) {

                return item.id === itemId;

            }
        );


    if (itemIndex === -1) {
        return;
    }


    const removedItem =
        roomData.items[itemIndex];


    roomData.items.splice(
        itemIndex,
        1
    );


    addActivity(
        currentUser,
        "removed " +
        removedItem.name
    );


    saveRoomData();


    renderCart();

    renderActivity();

}


/* ================= RENDER CART ================= */

function renderCart() {

    const cartContainer =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("cartTotal");


    if (!cartContainer) {
        return;
    }


    if (roomData.items.length === 0) {

        cartContainer.innerHTML = `

            <div class="empty-cart">

                <i class="bi bi-cart-x"></i>

                <p>
                    No items added yet.
                </p>

            </div>

        `;

        if (totalElement) {

            totalElement.textContent =
                "Total: ₹0";

        }

        return;
    }


    let total = 0;


    cartContainer.innerHTML = "";


    roomData.items.forEach(
        function (item) {

            const itemTotal =
                item.quantity * item.price;


            total += itemTotal;


            const itemElement =
                document.createElement("div");


            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div>

                    <h6>
                        ${escapeHTML(item.name)}
                    </h6>

                    <small>
                        ${item.quantity} × ₹${item.price.toFixed(2)}
                    </small>

                    <br>

                    <small>
                        Added by: ${escapeHTML(item.addedBy)}
                    </small>

                </div>


                <div class="d-flex align-items-center gap-3">

                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="removeItem(${item.id})">

                        <i class="bi bi-trash"></i>

                    </button>

                </div>

            `;


            cartContainer.appendChild(
                itemElement
            );

        }
    );


    if (totalElement) {

        totalElement.textContent =
            "Total: ₹" + total.toFixed(2);

    }

}


/* ================= ACTIVITY LOG ================= */

function addActivity(user, action) {

    const activity = {

        id: Date.now() + Math.random(),

        user: user,

        action: action,

        time: new Date().toLocaleString()

    };


    roomData.activity.unshift(
        activity
    );


    /* Keep latest 50 activities */

    if (roomData.activity.length > 50) {

        roomData.activity =
            roomData.activity.slice(0, 50);

    }

}


/* ================= RENDER ACTIVITY ================= */

function renderActivity() {

    const activityContainer =
        document.getElementById(
            "activityLog"
        );


    if (!activityContainer) {
        return;
    }


    if (roomData.activity.length === 0) {

        activityContainer.innerHTML = `

            <p class="text-muted">
                No activity yet.
            </p>

        `;

        return;
    }


    activityContainer.innerHTML = "";


    roomData.activity.forEach(
        function (activity) {

            const activityElement =
                document.createElement("div");


            activityElement.className =
                "activity-item";


            activityElement.innerHTML = `

                <strong>
                    ${escapeHTML(activity.user)}
                </strong>

                ${escapeHTML(activity.action)}

                <br>

                <small class="text-muted">
                    ${escapeHTML(activity.time)}
                </small>

            `;


            activityContainer.appendChild(
                activityElement
            );

        }
    );

}


/* ================= PRINT RECEIPT ================= */

function printReceipt() {

    if (currentRoom === "") {

        alert(
            "Please join a room first."
        );

        return;
    }


    document.getElementById(
        "printRoom"
    ).textContent = currentRoom;


    document.getElementById(
        "printUser"
    ).textContent = currentUser;


    const printItems =
        document.getElementById(
            "printItems"
        );


    let total = 0;


    printItems.innerHTML = "";


    if (roomData.items.length === 0) {

        printItems.innerHTML =
            "<p>No items in cart.</p>";

    } else {

        roomData.items.forEach(
            function (item) {

                const itemTotal =
                    item.quantity * item.price;


                total += itemTotal;


                const row =
                    document.createElement("p");


                row.innerHTML = `

                    ${escapeHTML(item.name)}
                    -
                    ${item.quantity} × ₹${item.price.toFixed(2)}
                    =
                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>

                `;


                printItems.appendChild(row);

            }
        );

    }


    document.getElementById(
        "printTotal"
    ).textContent =
        total.toFixed(2);


    window.print();

}


/* ================= LEAVE ROOM ================= */

function leaveRoom() {

    const confirmation =
        confirm(
            "Are you sure you want to leave this room?"
        );


    if (!confirmation) {
        return;
    }


    if (roomChannel) {

        roomChannel.close();

        roomChannel = null;

    }


    currentUser = "";

    currentRoom = "";

    roomData = {

        items: [],

        activity: []

    };


    document.getElementById(
        "dashboard"
    ).classList.add("d-none");


    showRoomSection();


    document.getElementById(
        "roomCode"
    ).value = "";


    document.getElementById(
        "roomMessage"
    ).innerHTML = "";

}


/* ================= ROOM MESSAGE ================= */

function showRoomMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "roomMessage"
        );


    if (!messageElement) {
        return;
    }


    messageElement.innerHTML = `

        <div class="alert alert-${type}">
            ${escapeHTML(message)}
        </div>

    `;

}


/* ================= HTML ESCAPE ================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* ================= STORAGE EVENT ================= */

/*
   This event works when localStorage
   changes in another browser tab.
*/

window.addEventListener(
    "storage",
    function (event) {

        if (
            currentRoom !== "" &&
            event.key === getStorageKey()
        ) {

            loadRoomData();

        }

    }
);


/* ================= PAGE LOAD ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "CartShare application loaded successfully."
        );

    }
);
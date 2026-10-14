let currentUser = localStorage.getItem("warrantyUser") || "";

function getWarranties() {
    return JSON.parse(
        localStorage.getItem("warranties_" + currentUser) || "[]"
    );
}

function saveWarranties(data) {
    localStorage.setItem(
        "warranties_" + currentUser,
        JSON.stringify(data)
    );
}

function login(event) {
    event.preventDefault();

    const name = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !password) {
        return;
    }

    currentUser = name;
    localStorage.setItem("warrantyUser", currentUser);

    document.getElementById("loginMessage").textContent =
        "Login successful!";

    updateHome();
    showPage("home");
}

function logout() {
    localStorage.removeItem("warrantyUser");
    currentUser = "";
    showPage("login");
}

function showPage(pageId) {
    if (pageId !== "login" && !currentUser) {
        pageId = "login";
    }

    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");

    if (pageId === "home") {
        updateHome();
    }

    if (pageId === "warranties") {
        displayWarranties();
    }
}

function addWarranty(event) {
    event.preventDefault();

    if (!currentUser) {
        showPage("login");
        return;
    }

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const serial = document.getElementById("serial").value.trim();
    const purchaseDate = document.getElementById("purchaseDate").value;
    const duration = Number(document.getElementById("duration").value);
    const seller = document.getElementById("seller").value.trim();

    const purchase = new Date(purchaseDate + "T12:00:00");

    if (!product || !brand || !serial || !seller ||
        !purchaseDate || !duration || isNaN(purchase.getTime())) {
        document.getElementById("formMessage").textContent =
            "Please fill in all fields correctly.";
        return;
    }

    if (purchase > new Date()) {
        document.getElementById("formMessage").textContent =
            "Purchase date cannot be in the future.";
        return;
    }

    const expiry = new Date(purchase);
    expiry.setMonth(expiry.getMonth() + duration);

    const warranties = getWarranties();

    warranties.push({
        id: Date.now(),
        product: product,
        brand: brand,
        serial: serial,
        purchaseDate: purchaseDate,
        duration: duration,
        expiryDate: expiry.toISOString().slice(0, 10),
        seller: seller
    });

    saveWarranties(warranties);

    document.getElementById("formMessage").textContent =
        "Warranty saved successfully!";

    event.target.reset();
    updateHome();
}

function displayWarranties() {
    const list = document.getElementById("warrantyList");
    const searchInput = document.getElementById("search");
    const filterInput = document.getElementById("filter");

    if (!list || !currentUser) {
        return;
    }

    const search = searchInput.value.toLowerCase().trim();
    const filter = filterInput.value;
    const warranties = getWarranties();

    list.innerHTML = "";

    const filtered = warranties.filter(function(item) {
        const matchesSearch =
            item.product.toLowerCase().includes(search) ||
            item.brand.toLowerCase().includes(search);

        const isExpired = item.expiryDate < today();

        const matchesFilter =
            filter === "all" ||
            (filter === "active" && !isExpired) ||
            (filter === "expired" && isExpired);

        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        list.textContent = "No warranties found.";
        return;
    }

    filtered.forEach(function(item) {
        const isExpired = item.expiryDate < today();

        const card = document.createElement("div");
        card.className = "warranty-card";

        const title = document.createElement("h3");
        title.textContent = item.product;

        const status = document.createElement("span");
        status.className = "status " + (isExpired ? "expired" : "active");
        status.textContent = isExpired ? "Expired" : "Active";

        const details = document.createElement("p");
        details.textContent =
            "Brand: " + item.brand +
            " | Serial Number: " + item.serial;

        const purchase = document.createElement("p");
        purchase.textContent =
            "Purchase Date: " + item.purchaseDate;

        const expiry = document.createElement("p");
        expiry.textContent =
            "Warranty Expiry: " + item.expiryDate;

        const seller = document.createElement("p");
        seller.textContent = "Seller: " + item.seller;

        card.append(title, status, details, purchase, expiry, seller);
        list.appendChild(card);
    });
}

function today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function updateHome() {
    if (!currentUser) {
        return;
    }

    const warranties = getWarranties();
    const active = warranties.filter(function(item) {
        return item.expiryDate >= today();
    });

    document.getElementById("totalCount").textContent =
        warranties.length;

    document.getElementById("activeCount").textContent =
        active.length;

    document.getElementById("expiredCount").textContent =
        warranties.length - active.length;
}

document.addEventListener("DOMContentLoaded", function() {
    if (currentUser) {
        updateHome();
        showPage("home");
    } else {
        showPage("login");
    }

});

self.addEventListener("push", function(event) {

    let data = {};

    try {
        data = event.data.json();
    } catch (error) {
        data = {
            title: "📚 MyStudy",
            body: event.data
                ? event.data.text()
                : "Новое уведомление"
        };
    }

    const title = data.title || "📚 MyStudy";

    const options = {
        body: data.body || "",
        icon: "icon.png",
        badge: "icon.png"
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
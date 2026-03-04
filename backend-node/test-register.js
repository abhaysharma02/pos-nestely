async function test() {
    try {
        const res = await fetch("http://localhost:8080/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenantName: "Test Cafe",
                name: "Admin",
                email: "test.admin" + Date.now() + "@nestely.com",
                password: "password123",
                role: "ADMIN"
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
test();

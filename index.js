// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2508-FTB-ET-WEB-FT";
const API = BASE + COHORT;

// === State ===
let events = [];
let selectedEvent;
let guests = [];
let rsvps = [];

// State function to update state by fetching an array of events
// from the API.
async function getEvents() {
  try {
    const res = await fetch(API + "/Events");
    const json = await res.json();
    events = json.data;
    render();
  } catch (err) {
    console.log(err);
  }
}

// State function to update state by fetching a single event
// from the API.
async function getEvent(id) {
  try {
    const res = await fetch(`${API}/Events/` + id);
    const json = await res.json();
    selectedEvent = json.data;
    render();
  } catch (err) {
    console.log(err);
  }
}
// State function to update state by fetching an array of guests
// from the API
async function getGuests() {
  try {
    const res = await fetch(API + "/guests");
    const json = await res.json();
    guests = json.data;
    render();
  } catch (err) {
    console.log(err);
  }
}
// State function to update state by fetching an array of RSVPs
// from the API
async function getRSVPs() {
  try {
    const res = await fetch(API + "/rsvps");
    const json = await res.json();
    rsvps = json.data;
    render();
  } catch (err) {
    console.log(err);
  }
}

async function addEvent(event) {
  try {
    await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    await getEvents();
  } catch (err) {
    console.error(err);
  }
}

async function removeEvent(id) {
  try {
    const res = fetch(API + "/events" + id, {
      method: "DELETE",
    });
    if (res.status === 204) {
      selectedEvent = null;
      getEvents();
    }
  } catch (err) {
    console.error(err);
  }
}

// === Components ===

// function with event listener when party name is clicked on
// the application updates state by fetching information about a
// single part from the API.
function EventListItem(event) {
  const $li = document.createElement("li");

  if (event.id === selectedEvent?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `<a href = "#selected">${event.name}</a>`;
  $li.addEventListener("click", async function () {
    await getEvent(event.id);
  });
  return $li;
}

// Function to render list of party names
function EventList() {
  const $ul = document.createElement("ul");
  const $events = events.map(EventListItem);
  $ul.replaceChildren(...$events);
  return $ul;
}

// Function that creates a form for users to input name, description,
// date, and location of a new event
function NewEventForm() {
  const $form = document.createElement("form");
  $form.classList.add("eventForm");
  $form.innerHTML = `
  <label>
  Name
  <input name = "name" required />
  </label>
  <label>
  Description
  <input name = "description" required/>
  </label>
  <label>
  Date
  <input name = "date" type = "date" required />
  </label>
  <label>
  Location
  <input name = "location" required/>
  </label>
  <button>Create Event</button>
  `;

  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData($form);
    const date = new Date(data.get("date")).toISOString();
    addEvent({
      name: data.get("name"),
      description: data.get("description"),
      date,
      location: data.get("location"),
    });
  });
  return $form;
}

// Function to render name, ID, date, description, and location
// of selectied party.
function EventDetails() {
  if (!selectedEvent) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to know more.";
    return $p;
  }

  const $section = document.createElement("section");
  $section.classList.add("event");
  $section.innerHTML = `
    <h3>${selectedEvent.name} #${selectedEvent.id}</h3>
        <time datetime = "${selectedEvent.date}">
        ${selectedEvent.date.slice(0, 10)}
        </time>
        <address>${selectedEvent.location}</address>
        <p>${selectedEvent.description}</p>
        <GuestList></GuestList>
        <button>Remove Event</button>`;

  const removeButton = $section.querySelector("button");
  removeButton.addEventListener("click", function () {
    removeEvent(selectedEvent.id);
  });
  $section.querySelector("GuestList").replaceWith(GuestList());
  console.log(GuestList());
  return $section;
}
// Function that filters the guests with who RSVP'd to which event.
function GuestList() {
  const $ul = document.createElement("ul");
  const eventGuestRsvp = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedEvent.id
    )
  );
  const $guests = eventGuestRsvp.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);
  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section class = "upcoming">
        <h2>Upcoming Parties</h2>
        <EventList></EventList>
        <h3>Create a new event</h3>
        <NewEventForm></NewEventForm>
      </section>
      <section class = "details" id="selected">
        <h2>Party Details</h2>
        <EventDetails></EventDetails>
      </section>
    </main>
  `;
  $app.querySelector("EventList").replaceWith(EventList());
  $app.querySelector("NewEventForm").replaceWith(NewEventForm());
  $app.querySelector("EventDetails").replaceWith(EventDetails());
}

async function initialize() {
  await getEvents();
  await getGuests();
  await getRSVPs();
  render();
}

initialize();

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { eventsApi } from "@/services/orders";
import { useCart } from "@/hooks/useCart";
import { Calendar, MapPin, Ticket, ShoppingCart } from "lucide-react";
import type { Event } from "@/types";

export function EventsPage() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [events, setEvents] = useState<Event[]>([]);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { size: 24 };
        if (city) params.city = city;
        const data = await eventsApi.list(params);
        setEvents(data.items);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [city]);

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl text-utv-cream mb-8">{t("events.title")}</h1>

        {/* City Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {["All", "New York", "London", "Paris", "Kigali", "Nairobi"].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c === "All" ? "" : c)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                (city === "" && c === "All") || city === c
                  ? "bg-utv-gold text-utv-bg"
                  : "bg-utv-border text-utv-body hover:text-utv-cream"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-utv-bg-light rounded-xl animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden hover:border-utv-gold/50 transition-all"
              >
                <Link to={`/events/${event.id}`}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={event.cover_url || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-utv-gold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(event.start_datetime).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <h3 className="font-display text-lg text-utv-cream font-semibold group-hover:text-utv-gold transition-colors">
                      {event.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-utv-body mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.venue}, {event.city}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-utv-gold">${event.price}</span>
                      <span className="text-xs text-utv-body">
                        {event.tickets_available > 0
                          ? `${event.tickets_available} ${t("events.ticketsLeft")}`
                          : t("events.soldOut")}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          item_type: "ticket",
                          item_id: event.id,
                          quantity: 1,
                          title: event.title,
                          price: parseFloat(event.price) || 0,
                          image: event.cover_url,
                        })
                      }
                      disabled={event.tickets_available === 0}
                      className="flex items-center gap-1.5 bg-utv-gold text-utv-bg px-4 py-2 rounded-lg text-sm font-medium hover:bg-utv-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t("events.getTickets")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

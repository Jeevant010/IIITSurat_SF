/**
 * Models Index
 *
 * This file ensures all Mongoose models are properly registered
 * before any populate() operations are performed.
 *
 * Import this file at the top of any page that uses populate()
 * to ensure all referenced models are available.
 */

// Import all models to register them with Mongoose
import User from "./User";
import Team from "./Team";
import JoinRequest from "./JoinRequest";
import SiteSettings from "./SiteSettings";
import Match from "./Match";
import Announcement from "./Announcement";

// Export types
export type { IUser } from "./User";
export type { ITeam } from "./Team";
export type { IMatch } from "./Match";
export type { IAnnouncement } from "./Announcement";
export type { ISiteSettings } from "./SiteSettings";

// Export all models
export { User, Team, JoinRequest, SiteSettings, Match, Announcement };

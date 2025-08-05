import { Listing } from '@/types/listing';
import { theEdgeOnMainData } from './listings/the-edge-on-main';
import { marshallStLouisData } from './listings/marshall-st-louis';
import { soGoodDallasData } from './listings/sogood-dallas';
import upCampusRenoData from './listings/up-campus-reno';

export const listings: Listing[] = [theEdgeOnMainData, marshallStLouisData, soGoodDallasData, upCampusRenoData];

export const getListingBySlug = (slug: string): Listing | undefined => {
    return listings.find(listing => listing.listingSlug === slug);
}; 
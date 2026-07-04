export interface Account {
  id: string;
  name: string;
  phone_number: string;
  role: 'admin' | 'warehouse_manager' | 'crew';
  active_project_ids?: string[];
}

export interface Project {
  id: string;
  name: string;
  production_company: string;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'wrapped' | 'upcoming';
}

export interface Item {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  photos?: string[];
  description?: string;
  baseline_condition?: string;
  current_status: 'AVAILABLE' | 'CHECKED_OUT' | 'IN_USE_ELSEWHERE' | 'RESERVED' | 'MISSING';
  location?: string;
  is_high_value: boolean;
}

export interface Movement {
  id: string;
  item_id: string;
  item_name?: string;
  item_category?: string;
  checkout_person_name?: string;
  quantity_out: number;
  quantity_returned: number;
  quantity_damaged: number;
  quantity_missing: number;
  checkout_account_id: string;
  return_verified_by_account_id?: string;
  project_id?: string;
  condition_note_out?: string;
  condition_note_in?: string;
  photos_out?: string[];
  photos_in?: string[];
  checked_out_at: string;
  expected_return_date?: string;
  returned_at?: string;
  status: 'active' | 'returned' | 'flagged';
  batch_id?: string;
}

export interface Batch {
  id: string;
  project_id: string;
  project_name?: string;
  person_in_charge_id: string;
  crew_name?: string;
  store_keeper_id: string;
  store_keeper_name?: string;
  name: string;
  type: 'pickup' | 'return';
  created_at: string;
  item_count?: number;
  active_count?: number;
  details?: Movement[];
}

export interface DamageReport {
  id: string;
  item_id: string;
  item_name?: string;
  movement_id?: string;
  reported_by_account_id: string;
  reporter_name?: string;
  responsible_crew_id: string;
  responsible_person_name?: string;
  billing_price: number;
  note: string;
  resolved: boolean;
  created_at: string;
}

export interface Flag {
  id: string;
  item_id: string;
  movement_id?: string;
  flagged_by_account_id: string;
  note: string;
  created_at: string;
  resolved: boolean;
}

export interface HandoverNote {
  id: string;
  project_id: string;
  written_by_account_id: string;
  content: string;
  created_at: string;
  acknowledged: boolean;
}

<?php
defined('BASEPATH') or exit('No direct script access allowed');

class KepegawaianProdi extends CI_Controller
{
    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        is_logged_in();
        $this->load->model('model_karyawan');
        $this->load->model('model_pelatihan');
        $this->load->model('model_pendidikan');
        $this->load->model('data_param');
    }

    public function index()
    {
        $data['titel'] = 'Karyawan';
        $id = $this->session->userdata('prodi');
        $data['karyawan'] = $this->model_karyawan->get_karyawan($id);
        $this->load->view('page_karyawan', $data);
    }
    public function karyawan_detil($nik)
    {
        $data['titel'] = 'Data Karyawan';
        $data['karyawan'] = $this->model_karyawan->get_profil($nik);
        $this->load->view('page_detil_karyawan', $data);
    }

    public function add()
    {
        $nik = $this->input->post('nik');
        $nama = $this->input->post('nama');
        $tempatLahir = $this->input->post('tempat_lahir');
        $tanggal_lahir = $this->input->post('tanggal_lahir');
        $jenis_kelamin = $this->input->post('jenis_kelamin');
        $nomor_ktp = $this->input->post('nomor_ktp');
        $alamat = $this->input->post('alamat');
        $telepon = $this->input->post('telepon');
        $penempatan = $this->input->post('penempatan');
        $jabatan_struktural = $this->input->post('jabatan_struktural');
        $gelar_akademik_depan = $this->input->post('gelar_akademik_depan');
        $gelar_akademik_belakang = $this->input->post('gelar_akademik_belakang');
        $mulai_masuk_pegawai = $this->input->post('mulai_masuk_pegawai');
        $mulai_semester = $this->input->post('mulai_semester');
        $kode_jenjang_pendidikan = $this->input->post('kode_jenjang_pendidikan');
        $ikatan_kerja = $this->input->post('ikatan_kerja');
        $data = [
            'nik' => $nik,
            'nama' => $nama,
            'tempat_lahir' => $tempatLahir,
            'tanggal_lahir' => $tanggal_lahir,
            'jenis_kelamin' => $jenis_kelamin,
            'nomor_ktp' => $nomor_ktp,
            'alamat' => $alamat,
            'telepon' => $telepon,
            'penempatan' => $penempatan,
            'jabatan_struktural' => $jabatan_struktural,
            'gelar_akademik_depan' => $gelar_akademik_depan,
            'gelar_akademik_belakang' => $gelar_akademik_belakang,
            'mulai_masuk_pegawai' => $mulai_masuk_pegawai,
            'mulai_semester' => $mulai_semester,
            'kode_jenjang_pendidikan' => $kode_jenjang_pendidikan,
            'ikatan_kerja' => $ikatan_kerja,
        ];
        $this->model_karyawan->add_karyawan($data);
        $this->session->set_flashdata('message', 'Data Tersimpan');
        redirect('kepegawaianProdi/karyawan', 'refresh');
    }

    public function updateKeluarga()
    {
        $nik = $this->input->post('nik');
        $statusKawin = $this->input->post('status_perkawinan');
        $nama_ismi = $this->input->post('nama_ismi');
        $pekerjaan = $this->input->post('pekerjaan_ismi');
        //upload gambar
        $config['upload_path']   = './assets/kk/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        //cekdata
        if ($this->model_karyawan->get_riwayat_keluarga($nik)) {
            if ($this->upload->do_upload('kk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'status_perkawinan' => $statusKawin,
                    'nama_ismi' => $nama_ismi,
                    'pekerjaan_ismi' => $pekerjaan,
                    'upload_kk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->update_keluarga($data, $nik);
                $this->session->set_flashdata('message', 'berhasil Di update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        } else {
            if ($this->upload->do_upload('kk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'status_perkawinan' => $statusKawin,
                    'nama_ismi' => $nama_ismi,
                    'pekerjaan_ismi' => $pekerjaan,
                    'upload_kk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->insert_keluarga($data);
                $this->session->set_flashdata('message', 'berhasil Di Insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik, 'refresh');
    }
    public function update_kepegawaian()
    {
        $nik = $this->input->post('nik');
        $status_kepegawaian = $this->input->post('status_kepegawaian');
        $status_keaktivan = $this->input->post('status_keaktivan');
        $tmt = $this->input->post('tmt');
        $penempatan = $this->input->post('penempatan');
        $nomor_sk = $this->input->post('nomor_sk');
        $lembaga_pengangkat = $this->input->post('lembaga_pengangkat');
        $sumber_gaji = $this->input->post('sumber_gaji');
        //$last_upload 
        //upload gambar
        $config['upload_path']   = './assets/SK/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        //cekdata
        if ($this->model_karyawan->get_riwayat_pengangkatan($nik)) {
            if ($this->upload->do_upload('sk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'status_kepegawaian' => $status_kepegawaian,
                    'status_keaktivan' => $status_keaktivan,
                    'tmt' => $tmt,
                    'penempatan' => $penempatan,
                    'nomor_sk' => $nomor_sk,
                    'lembaga_pengangkat' => $lembaga_pengangkat,
                    'sumber_gaji' => $sumber_gaji,
                    'upload_sk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->update_pegawai($data, $nik);
                $this->session->set_flashdata('message', 'berhasil Di update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        } else {
            if ($this->upload->do_upload('sk_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'status_kepegawaian' => $status_kepegawaian,
                    'status_keaktivan' => $status_keaktivan,
                    'tmt' => $tmt,
                    'penempatan' => $penempatan,
                    'nomor_sk' => $nomor_sk,
                    'lembaga_pengangkat' => $lembaga_pengangkat,
                    'sumber_gaji' => $sumber_gaji,
                    'upload_sk' => $file_upload['file_name'],
                    'last_upload' => date("Y-m-d H:i:s")
                ];
                $this->model_karyawan->insert_pegawai($data);
                $this->session->set_flashdata('message', 'berhasil Di Insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                var_dump($error);
            }
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik, 'refresh');
    }
    public function updateKependudukan()
    {
        $nik = $this->input->post('nik');
        $nomor_ktp = $this->input->post('nomor_ktp');
        $telepon = $this->input->post('telepon');
        $agama = $this->input->post('agama');
        $alamat = $this->input->post('alamat');
        //upload gambar
        $config['upload_path']   = './assets/KTP/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('ktp_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'nomor_ktp' => $nomor_ktp,
                'telepon' => $telepon,
                'agama' => $agama,
                'alamat' => $alamat,
                'upload_ktp' => $file_upload['file_name'],
            ];
            $this->model_karyawan->update_kependudukan($data, $nik);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik,  'refresh');
    }

    public function updateProfil()
    {
        $nik = $this->input->post('nik');
        $nama = $this->input->post('nama');
        $jenis_kelamin = $this->input->post('jenis_kelamin');
        $tempat_lahir = $this->input->post('tempat_lahir');
        $tanggal_lahir = $this->input->post('tanggal_lahir');
        $data = [
            'nama' => $nama,
            'jenis_kelamin' => $jenis_kelamin,
            'tempat_lahir' => $tempat_lahir,
            'tanggal_lahir' => $tanggal_lahir
        ];
        $this->model_karyawan->update_profil($data, $nik);
        $this->session->set_flashdata(' message ', ' berhasil Di Update');
        redirect('kepegawaianProdi/karyawan_detil/' . $nik,  'refresh');
    }
    public function update_poto_profil()
    {
        $nik = $this->input->post('nik');
        //upload gambar
        $config['upload_path']   = './assets/foto/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('poto_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'pp' => $file_upload['file_name'],
            ];
            $this->model_karyawan->update_poto($data, $nik);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik,  'refresh');
    }
    public function update_pajak()
    {
        $nik = $this->input->post('nik');
        $nomor_npwp = $this->input->post('nomor_npwp');
        //upload gambar
        $config['upload_path']   = './assets/npwp/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->model_karyawan->get_pajak($nik)) {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nomor_npwp' => $nomor_npwp,
                    'upload_npwp' => $file_upload['file_name']
                ];
                $this->model_karyawan->update_npwp($data, $nik);
                $this->session->set_flashdata(' message ', ' berhasil Di Update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        } else {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'nomor_npwp' => $nomor_npwp,
                    'upload_npwp' => $file_upload['file_name']
                ];
                $this->model_karyawan->insert_npwp($data);
                $this->session->set_flashdata(' message ', ' berhasil Di insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik,  'refresh');
    }
    public function update_askes()
    {
        $nik = $this->input->post('nik');
        $no_askes = $this->input->post('no_askes');
        $nama_askes = $this->input->post('nama_askes');
        //upload gambar
        $config['upload_path']   = './assets/askes/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->model_karyawan->get_askes($nik)) {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'no_askes' => $no_askes,
                    'nama_askes' => $nama_askes,
                    'upload_askes' => $file_upload['file_name']
                ];
                $this->model_karyawan->update_askes($data, $nik);
                $this->session->set_flashdata(' message ', ' berhasil Di Update');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        } else {
            if ($this->upload->do_upload('npwp_upload')) {
                $file_upload = $this->upload->data();
                $data = [
                    'nik' => $nik,
                    'no_askes' => $no_askes,
                    'nama_askes' => $nama_askes,
                    'upload_askes' => $file_upload['file_name']
                ];
                $this->model_karyawan->insert_askes($data);
                $this->session->set_flashdata(' message ', ' berhasil Di insert');
            } else {
                $error = array('error' => $this->upload->display_errors());
                $this->session->set_flashdata(' message ', $error);
            }
        }
        redirect('kepegawaianProdi/karyawan_detil/' . $nik,  'refresh');
    }
    //!riwayat pendidikan karyawan
    public function riwayat($nik)
    {
        $data['titel'] = 'Riwayat Pendidikan';
        $data['pendidikan'] = $this->model_pendidikan->get_pendidikan($nik);
        $data['riwayat'] = $this->model_pendidikan->get_riwayat_pendidikan($nik);
        $data['jenjang'] = $this->model_pendidikan->get_jenjang();
        $this->load->view('page_pendidikan', $data);
    }
    public function insert_pendidikan()
    {
        $nik = $this->input->post('nik');
        $jenjang = $this->input->post('jenjang');
        $asal_sekolah = $this->input->post('asal_sekolah');
        $tahun_lulus = $this->input->post('tahun_lulus');
        $data = [
            'nik' => $nik,
            'id_pendidikan' => $jenjang,
            'asal_pendidikan' => $asal_sekolah,
            'tahun_lulus' => $tahun_lulus
        ];
        $this->model_pendidikan->insert_pendidikan($data);
        $this->session->set_flashdata(' message ', ' berhasil Di Insert');
        redirect('kepegawaianProdi/riwayat/' . $nik);
    }
    public function upload_ijazah()
    {
        $nik = $this->input->post('nik');
        $id = $this->input->post('id');
        //upload gambar
        $config['upload_path']   = './assets/ijazah/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('ijazah_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'upload_ijazah' => $file_upload['file_name'],
            ];
            $this->model_pendidikan->update_ijazah($data, $id);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        $this->session->set_flashdata(' message ', ' berhasil Di Upload');
        redirect('kepegawaianProdi/riwayat/' . $nik,  'refresh');
    }

    public function delete($id)
    {
        $ijazah = $this->model_pendidikan->get_ijazah($id);
        foreach ($ijazah as $p) {
            $nik = $p['nik'];
            $filename =  $p['upload_ijazah'];
            unlink(FCPATH . "assets/ijazah/$filename");
        }
        $this->db->delete('riwayat_pendidikan', ['id' => $id]);
        $this->session->set_flashdata(' message ', ' berhasil Di Hapus');
        redirect('kepegawaianProdi/riwayat/' . $nik,  'refresh');
    }
    //! disini riwayat pelatihan karyawan
    public function riwayatPelatihan($nik)
    {
        $data['titel'] = 'Riwayat Pelatihan';
        $data['pelatihan'] = $this->model_pelatihan->get_pelatihan($nik);
        $data['riwayat'] = $this->model_pelatihan->get_riwayat($nik);
        $this->load->view('page_pelatihan', $data);
    }
    public function insert_pelatihan()
    {
        $nik = $this->input->post('nik');
        $nama_diklat = $this->input->post('nama_diklat');
        $no_sertifikat = $this->input->post('no_sertifikat');
        $tahun = $this->input->post('tahun');
        $tempat = $this->input->post('tempat');
        $data = [
            'nik' => $nik,
            'nama_diklat' => $nama_diklat,
            'no_sertifikat' => $no_sertifikat,
            'tahun' => $tahun,
            'tempat' => $tempat
        ];
        $this->model_pelatihan->insert_pelatihan($data);
        $this->session->set_flashdata(' message ', ' berhasil Di Insert');
        redirect('kepegawaianProdi/riwayatPelatihan/' . $nik);
    }
    public function upload_sertifikat()
    {
        $nik = $this->input->post('nik');
        $id = $this->input->post('id');
        //upload gambar
        $config['upload_path']   = './assets/sertifikat/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('sertifikat_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'upload' => $file_upload['file_name'],
            ];
            $this->model_pelatihan->update_sertifikat($data, $id);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('kepegawaianProdi/riwayatPelatihan/' . $nik);
    }

    public function deletePelatihan($id)
    {
        $sertifikat = $this->model_pelatihan->get_sertifikat($id);
        foreach ($sertifikat as $p) {
            $nik = $p['nik'];
            $filename =  $p['upload'];
            unlink(FCPATH . "assets/sertifikat/$filename");
        }
        $this->db->delete('riwayat_pelatihan', ['id' => $id]);
        $this->session->set_flashdata(' message ', ' berhasil Di Hapus');
        redirect('kepegawaianProdi/riwayatPelatihan/' . $nik,  'refresh');
    }
}
